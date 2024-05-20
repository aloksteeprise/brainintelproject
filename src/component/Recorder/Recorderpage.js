/*
Reference :: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
*/

import './RecorderPage.scss';
import { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import Header from '../Header/Header';
import Footer from './Footer.js';
import jsPDF from 'jspdf';

let mediaRecorder;
let audioCtx;

function RecorderPage() {

  const [state, setState] = useState({
    startAnalysis: true,
    recording: false,
    completed: false,
    submitted: false,
    record: false,
    view: false,
    audioFile: null,
  });

  const textContent =
    'When the sunlight strikes raindrops in the air, they act as a prism  and form a rainbow. The rainbow is a division of white light into many beautiful colors. These take the shape of a long round arch, with its path high above, and its two ends apparently beyond the horizon. There is, according to legend, a boiling pot of gold at one end. People look, but no one ever finds it. When a man looks for something beyond his reach, his friends say he is looking for the pot of gold at the end of the rainbow.';

  const [streamData, setStreamData] = useState();

  var albumBucketName = 'amplify-brainintelproject-dev-50421-deployment';
  var bucketRegion = 'ap-south-1';
  var IdentityPoolIdt = 'ap-south-1:9ed22e29-51b1-4d95-84a6-e10ab74b8ce3';

  AWS.config.region = bucketRegion; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolIdt,
  });
  AWS.config.update({
    region: bucketRegion,
    apiVersion: 'latest',
    credentials: {
      accessKeyId: 'AKIATZJIQJPCSOHHC4WG',
      secretAccessKey: '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',
    },
  });

  var s3 = new AWS.S3({
    apiVersion: '2012-10-17',
    params: { Bucket: albumBucketName },
  });
  // const mimeType = audioRecorder.mediaRecorder.mimeType; // Check if this indeed is 'audio/wav'
  // const mediaRecorder =

  useEffect(() => {
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('getUserMedia success:', stream);
        setStreamData(stream);
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleRecordingStopped;
      } catch (error) {
        console.error('getUserMedia error:', error);
      }
    };

    initializeMediaRecorder();
  }, []);

  let analyser, dataArray, bufferLength;
  const visualize = (stream) => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    const source = audioCtx.createMediaStreamSource(stream);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    //analyser.connect(audioCtx.destination);

    draw(analyser, dataArray, bufferLength);
  };

  const draw = () => {
    let canvas = document.querySelector('.visualizer');
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const canvasCtx = canvas.getContext('2d');

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      let v = dataArray[i] / 128.0;
      let y = (v * HEIGHT) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  };
  const analysisHandler = () => {
    setState((state) => ({
      ...state,
      startAnalysis: false,
      record: true,
    }));
  };

  const recordingHandler = () => {
    startRecording();
  };

  const recordHandler = () => {
    console.log(1);
    stopRecording();
  };


  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      const blob = new Blob([event.data], { type: 'audio/wav' });
      setState((prevState) => ({
        ...prevState,
        audioFile: blob,
      }));
    }
  };
  const handleRecordingStopped = () => {
    console.log('Recording stopped');
    setState((prevState) => ({
      ...prevState,
      recording: false,
      completed: true,
    }));
  };
  
  const submitHandler = () => {
    console.log('audio file');
    console.log(state.audioFile);
    let name = getFileName();
    const folderName = getUserFolderName();
    var params = {
      Body: state.audioFile,
      Bucket: albumBucketName,
      Key: `${folderName}/${name + '.wav'}`,
      // Key: name + '.wav',
    };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('success');
        createPdf(folderName,name)
      }
    });
    setState((state) => ({
      ...state,
      completed: false,
      submitted: true,
    }));
  };

  const createPdf = (folderName,name) => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    const doc = new jsPDF();
    doc.text(`Hello ${id}`, 10, 10);
    doc.text('This is a sample PDF file.', 10, 20);

    // Save the PDF
    const pdfBlob = doc.output('blob');
    var params = {
      // Body: state.audioFile,
      Bucket: albumBucketName,
      Key: `${folderName}/${name + '.pdf'}`,
      // Key: name + '.wav',
      Body: pdfBlob,
      ContentType: 'application/pdf',
    };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log('success');
      }
    });
    setState((state) => ({
      ...state,
      completed: false,
      submitted: true,
    }));
  };
  const getUserInfo = () => {
    return JSON.parse(localStorage.getItem('userObject'));
  };

  const getUserFolderName = () => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    if(id){
      id = id.split('@')[0];
    }
   return id;
  };

  const getFileName = () => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    const today = new Date();
    const yy = today.getFullYear().toString().substr(-2);
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    let hh = today.getHours();
    let mins = today.getMinutes();
    let secs = today.getSeconds();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (hh < 10) hh = '0' + hh;
    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;

let abc="BrainIntel" + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins+''+secs;
    // return id + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins;

    return "BrainIntel" + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins+''+secs;
  };

  const closeHandler = () => {
    setState((state) => ({
      ...state,
      submitted: false,
      startAnalysis: true,
    }));
  };

  const recordAgainHandler = () => {
    setState((state) => ({ ...state, completed: false, record: true }));
  };

  const [result, setResult] = useState([]);
  const [s3Files, s3SetFiles] = useState([]);
  const checkResults = () => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    const folderName = getUserFolderName();
    s3.listObjects({ Prefix: folderName }, function (err, data) {
      if (err) {
        return alert(
          'There was a brutal error viewing your album: ' + err.message
        );
      } else {
        console.log('list data--');
        console.log(data);

        let r = [];
        data.Contents.map((val) => {
          // if (val.Key.includes('.pdf')) {
          //   r.push(val.Key);
          // }
          if (val.Key) {
            r.push(val.Key);
          }
        });

        if (r.length) {
          setResult([...r]);
        }
      }
    });

    setState((state) => ({ ...state, startAnalysis: false, view: true }));
  };

  const backtoStart = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true }));
  };


  const backtoStartFromRecord = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true,record:false }));
  };

  useEffect(() => {
    if (state.recording) {
      startRecording();
    }
  }, [state.recording]);

  useEffect(() => {
    if (state.completed) {
      listenerRecording()
    }
  }, [state.completed]);

  const startRecording = () => {
    if (mediaRecorder && !state.recording) {
      mediaRecorder.start();
      console.log('Recording started');
      setState((prevState) => ({
        ...prevState,
        recording: true,
      }));
    }
  };

  const stopRecording = () => {
    console.log(2)
    if (mediaRecorder && state.recording) {
      mediaRecorder.stop();
    }
    setState((state) => ({
      ...state,
      startAnalysis: false,
      record: false,
    }));
  };

  const listenerRecording = () => {
    if(state.completed){
      const url = URL.createObjectURL(state.audioFile);
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      document.getElementById("myrecords").appendChild(audio);

    }
    
  }

  const onButtonClick = (key) => {
    // Parameters for downloading object
    const params = {
      Bucket: albumBucketName,
      Key: key,
    };

    // Generate a pre-signed URL for the object
    s3.getSignedUrl('getObject', params, (err, url) => {
      if (err) {
        console.error('Error', err);
      } else {
        // Download the object using the generated URL
        window.open(url, '_blank');
      }
    });
  };

  return (
    <div className="App" style={{ paddingBottom: '80px', overflowY: 'auto' }}>
      <Header />
      {/* first page */}
      {state.startAnalysis ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">Welcome {}</h1>
            <div className="para">
              With the help of our Speech Analysis AI and Machine Learning Tool,
              you can check your Happiness Index and get results in pdf format,
              so that you can decide next steps.
            </div>

            <button className="button" onClick={analysisHandler}>
              Click To Begin
            </button>

            <button className="button-secondary" onClick={checkResults}>
              Check Results
            </button>
          </div>
          <div></div>
        </div>
      ) : null}

      {/* 2nd page */}
      {state.record ? (
        <div className="main-div">
          <div></div>
          <div className="first">
            <h1 className="head">Start Analysis</h1>
            {/* <div className="para">
              Kindly allow the microphone to access. Click the Record button and
              read the text. Once done, you can click the stop button.
            </div> */}
            <div
              style={{
                // border: "1px solid #000" ,
                margin: '10px auto',
                padding: '15px 15px 0px',
              }}
            >
              {state.recording ? (
                <div>
                  <div className="para2">READ ALOUD THE FOLLOWING LINES</div>
                  <div className="myRecordScrollBox">
                    <marquee
                      direction="up"
                      className="marquee"
                      scrollamount="2"
                    >
                      <div className="marqueeText">{textContent}</div>
                    </marquee>
                  </div>
                </div>
              ) : (
                <div className=""></div>
              )}
              {state.recording ? (
                <>
                  <canvas
                    className="visualizer"
                    height="35px"
                    style={{ margin: '15px auto' }}
                  ></canvas>
                  <button
                    className="button"
                    onClick={() => {
                      recordHandler();
                      stopRecording();
                    }}
                  >
                    <div>Stop</div>
                  </button>
                </>
              ) : (
                <button
                  className="button"
                  onClick={() => {
                    recordingHandler();
                  }}
                >
                  Allow
                </button>
                
              )}
              {/* <button className="button" onClick={backtoStartFromRecord}>
                {' '}
                Close
              </button> */}
            </div>
          </div>
        </div>
      ) : null}

      {/* 3rd page */}
      {state.completed ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">Recording Complete</h1>
            <div className="para">
              Your speech is ready for testing, please listen to it. If not
              audible, please record it again.
            </div>
            <div id='myrecords'></div>
            <audio id="audioEle" className="audio" />
            <button className="button" onClick={submitHandler}>
              Submit for Analysis
            </button>
            <button className="button-secondary" onClick={recordAgainHandler}>
              Record Again
            </button>
          </div>
          <div></div>
        </div>
      ) : null}

      {/* 4th page */}
      {state.submitted ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">Recording submitted</h1>
            <div className="para">
              We will analyze the recording and share analysis with you shortly.
              Please check Results section after some time.
            </div>
            {/* <div className="FeedbackForm">
              <h1>Feedback</h1>
              <FeedbackForm />
            </div> */}
            <button className="button" onClick={closeHandler}>
              Close
            </button>
          </div>
          <div></div>
        </div>
      ) : null}
      {state.view ? (
        <div className="main-div" style={{ marginTop: '120px' }}>
          <div></div>
          <div className="first">
            <h1 className="head">View Analysis Results</h1>
            <div style={{ fontFamily: 'Proxima' }}>
              {result.length === 0 && <p> No records found!</p>}

              {result.length > 0 &&
                result.map((r) => {
                  console.log(r);
                  return (
                    <p>
                      {' '}
                      {/* Here is the link to */}
                      <label className="custLabel"
                        onClick={() => {
                          onButtonClick(r);
                        }
                      }
                      >
                        {' '}
                        {r}
                      </label>
                    </p>
                  );
                })}

              <button className="button" onClick={backtoStart}>
                {' '}
                Close
              </button>
            </div>
          </div>
          <div></div>
        </div>
      ) : null}

      
      <Footer />
    </div>
  );
}

export default RecorderPage;
