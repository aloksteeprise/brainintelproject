/*
Reference :: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
*/

import './RecorderPage.scss';
import { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import Header from '../Header/Header';
import Footer from './Footer.js';
import jsPDF from 'jspdf';
import { handlerLogs, submitFeedback, handleFetchUserAttributes } from '../../service/Authservice';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Tooltip } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import { array } from 'prop-types';
// import pdf from '../../../src/document/consent.pdf'
let mediaRecorder;
let audioCtx;

function RecorderPage() {

  const [feedbackValue, setFeedbackValue] = useState('');
  const [feedbackfilename , setFeedbackFilename ]= useState("")
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [attributes, setAttributes] = useState(null); 
  const [showTable, setShowTable] = useState(false);
  const [userfeedbackcount , setUserFeedbackcount ] = useState("0")
  const [headingText, setHeadingText] = useState('Kindly allow the microphone to record your voice');
  const [state, setState] = useState({
    startAnalysis: true,
    recording: false,
    completed: false,
    submitted: false,
    record: false,
    view: false,
    audioFile: null,
    feedbackVisible: false,

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
        handlerLogs('getUserMedia success: >');
        setStreamData(stream);
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.onstop = handleRecordingStopped;
      } catch (error) {
        handlerLogs(`getUserMedia > ` + error);
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
    setHeadingText('Start Recording'); // Change the heading text
    startRecording();
  };

  const recordHandler = () => {
    handlerLogs('recordHandler> ');
    stopRecording();
  };

  const feedbackHandler = () => {
    setState(prevState => ({
      ...prevState,
      feedbackVisible: true, // Show feedback section
      submitted: false, // Hide main content
      startAnalysis: false,
    recording: false,
    completed: false,

    }));
  };



  const handleFeedbackChange = (event) => {
    setFeedbackValue(event.target.value);
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
    handlerLogs(`handleRecordingStopped > ` + 'Recording stopped');
    setState((prevState) => ({
      ...prevState,
      recording: false,
      completed: true,
    }));
  };


  const submitHandler = () => {
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
        handlerLogs(`submitHandler > ` + err.stack);
      } else {
        setFeedbackFilename(name);
        debugger;
        setUserFeedbackcount("0")
        handlerLogs(`submitHandler > ` + 'success');

        // createPdf(folderName,name)
      }
    });
    setState((state) => ({
      ...state,
      completed: false,
      submitted: true,
    }));
  };


  // const submitHandler = async () => {
  //   let name = getFileName();
  //   const folderName = getUserFolderName();
  //   var params = {
  //     Body: state.audioFile,
  //     Bucket: albumBucketName,
  //     Key: `${folderName}/${name + '.wav'}`,
  //   };
  
  //   s3.putObject(params, async function (err, data) {
  //     if (err) {
  //       handlerLogs(`submitHandler > ` + err.stack);
  //     } else {
  //       setFeedbackFilename(name);
  //       await submitFeedback("", "0");  // Reset to "0" on new submission
  //       handlerLogs(`submitHandler > ` + 'success');
  //     }
  //   });
  
  //   setState((state) => ({
  //     ...state,
  //     completed: false,
  //     submitted: true,
  //   }));
  // };
  

  const createPdf = (folderName, name) => {
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    id = id.split('@')[0];
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
        handlerLogs(`createPdf > ` + err.stack);
      } else {
        handlerLogs(`createPdf > ` + 'success');
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
    // if(id){
    //   id = id.split('@')[0];
    // }
    if (id) {
      id = id.toLowerCase();
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
    //let abc="BrainIntel" + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins+''+secs;
    // return id + '_' + dd + '' + mm + '' + yy + '' + hh + '' + mins;
    id = id.split('@')[0];
    return id + '_' + dd + '' + mm + '' + yy + '_' + hh + '' + mins + '' + secs;
  };

  const closeHandler = () => {
    debugger;
    setState((state) => ({
      ...state,
      submitted: false,
      startAnalysis: true,
    }));
    setChecked(false)
  };


  //   setState((state) => ({
  //     ...state,
  //     submitted: false,
  //     completed: true,
  //     feedbackVisible:false
  //   }));
  // };

  const  closeHandler2 =async () =>{
    debugger;
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    let array1=[];
    let array2=[];
    let fileName ='';
    if(feedbackfilename && feedbackfilename.includes('_')){

      fileName = feedbackfilename.split('_')[1] +'_'+feedbackfilename.split('_')[2];
    }

    let inputValue =fileName +'-'+feedbackValue;
    setUserFeedbackcount("1");
    debugger;
    let result = await submitFeedback(inputValue , "1");
    setSnackbarMessage(result.message);
    setSnackbarOpen(true);
    setState((state) => ({
      ...state,
      completed: true,
      
      feedbackVisible: false
    }));
  }





  

  // const closeHandler2 = async () => {
  //   const userInfo = getUserInfo();
  //   let id = userInfo?.userId;
  //   let inputValue = id + '-' + feedbackValue;
  //   let result = await submitFeedback(inputValue);
  //   setSnackbarMessage(result.message);
  //   setSnackbarOpen(true);

  //   if (result.success) {
  //     try {
  //       const userAttributes = await handleFetchUserAttributes();
  //       setAttributes(userAttributes);
  //       setShowTable(true);
  //       setState((state) => ({
  //         ...state,

  //         feedbackVisible: false
  //       }));

  //     } catch (error) {
  //       console.error('Error fetching user attributes:', error);
  //       setAttributes(null);
  //     }
  //   }
  // };
  // const getFeedbackValue = (feedback) => {
  //   if (feedback) {
  //     const parts = feedback.split('-');
  //     return parts.length > 1 ? parts[1] : 'N/A';
  //   }
  //   return 'N/A';
  // };


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const recordAgainHandler = () => {
    setState((state) => ({ ...state, completed: false, record: true }));
  };

  const [result, setResult] = useState([]);
  const [s3Files, s3SetFiles] = useState([]);


  const checkResults = () => {
    debugger;
    const userInfo = getUserInfo();
    let id = userInfo?.userId;
    const folderName = getUserFolderName();
    s3.listObjects({ Prefix: folderName }, function (err, data) {
      if (err) {
        return alert('There was a brutal error viewing your album: ' + err.message);
      } else {
        handlerLogs(`checkResults > ` + JSON.stringify(data));
        const sortedContents = data.Contents.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
       let r = [];
        sortedContents.forEach((val) => {
          if (val.Key && val.Key.endsWith('.pdf')) { // Only include PDF files
            r.push(val.Key);
          }
        });
  
        if (r.length) {
          setResult([...r]);
        }
      }
    });
    setState((state) => ({ ...state, completed: false, view: true, startAnalysis: false,submitted:false ,  record: false,}));
  };
  
  

  const backtoStart = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true}));
    setChecked(false)
  };


  const backtoStartFromRecord = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true, record: false }));
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
      handlerLogs('Recording started');
      setState((prevState) => ({
        ...prevState,
        recording: true,
      }));
    }
  };

  const stopRecording = () => {
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
    if (state.completed) {
      const url = URL.createObjectURL(state.audioFile);
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      document.getElementById("myrecords").appendChild(audio);
      handlerLogs('listener Recording Appended');
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
        handlerLogs('getSignedUrl Error' + err);
      } else {
        // Download the object using the generated URL
        window.open(url, '_blank');
      }
    });
  };
  const checkHandler = () => {
    setChecked(!isChecked);
  };

const ReportActivity =( )=>{
  checkResults()
  
}

  return (
    <div className="App" style={{ paddingBottom: '80px', overflowY: 'auto' }}>

      < Header checkResults={checkResults} feedbackHandler={feedbackHandler}  />
      {/* first page */}
      {state.startAnalysis ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Welcome { }</h1>
            <div className="para">
              Experience unparalleled insights of your happiness index  with our advanced Speech Analysis AI and Machine Learning Technology! Empower yourself to take the next steps towards a happier, more fulfilling life.
            </div>

            <div className="tacbox" style={{ marginTop: "20px" }}>
              <input
                className="checkbox-class"
                type="checkbox"
                checked={isChecked}
                onChange={checkHandler}
              />
              <label for="checkbox">
                {' '}
                I read and agree to the attached <a href='https://amplify-brainintelproject-dev-50421-deployment.s3.ap-south-1.amazonaws.com/consent.pdf' target="_blank"

                >
                  Consent
                </a> file{' '}


              </label>
            </div>

            <Tooltip
              title={!isChecked ? 'Please accept the terms and conditions' : null}
            >

              <button className="button" onClick={analysisHandler} disabled={!isChecked}>
                Click To Start
              </button>

            </Tooltip>

            {/* <button className="button-secondary" onClick={checkResults}>
              Check Results
            </button> */}
          </div>
          <div></div>
        </div>
      ) : null}

      {/* 2nd page */}
      {state.record ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">{headingText}</h1>
            <div className="para">
              {state.recording ? (<p></p>) : (
                <p>Kindly Allow the microphone to access. Click on the 'Allow' button and read the text. Once done, you can click the 'Stop' button. </p>
              )}
            </div>
            <div
              style={{
                // border: "1px solid #000" ,
                margin: '10px auto',
                padding: '15px 15px 0px',
              }}
            >
              {state.recording ? (
                <div>

                  <div className="para2">READ ALOUD THE FOLLOWING LINES....</div>
                  <div className="myRecordScrollBox">
                    <marquee
                      direction="up"
                      className="marquee"
                      scrollamount="1"
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
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Recording Complete</h1>
            <div className="para">
              Your speech is ready for testing, please listen to it. If not
              audible, please record it again.
            </div>
            <div id='myrecords'></div>
            <audio id="audioEle" className="audio" />
            <div>
              <button className="button-secondary" onClick={recordAgainHandler}>
                Record Again, if not Audible
              </button>
              <br />

              {/* <button className="button-secondary" onClick={checkResults} style={{ marginTop: "5px" }}>
                Check Results
              </button> */}

              <button className="button" onClick={submitHandler}>
                Submit for pdf report generation
              </button>

             
            </div>

          </div>
          <div></div>
        </div>
      ) : null}


      {state.feedbackVisible && (
        <div className="feedback-section" >
          <FormControl component="fieldset">
            <h1 component="legend" className="head">Feedback on Report</h1>
            <RadioGroup
              aria-label="feedback"
              name="feedback"
              value={feedbackValue}
              onChange={handleFeedbackChange}
            >
              <FormControlLabel value="20" control={<Radio />} label="20%" />
              <FormControlLabel value="40" control={<Radio />} label="40%" />
              <FormControlLabel value="60" control={<Radio />} label="60%" />
              <FormControlLabel value="80" control={<Radio />} label="80%" />
            </RadioGroup>
          </FormControl>

          <button className="button" onClick={closeHandler2}>
            Submit
          </button>
        </div>
      )}

      {/* {showTable && attributes && (

        <div className='feedback-section' style={{display:"flex",justifyContent:"center",marginTop:"120px"}}>
          <table className="table table-striped table-bordered table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Email</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{attributes['email'] || 'N/A'}</td>
                <td>{getFeedbackValue(attributes['custom:Userfeedback']) || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )} */}

      {/* 4th page */}
      {state.submitted ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Check Your Reports</h1>
            <div className="para">
              Wait for 10 minutes for the report.
            </div>
            {/* <button className="button" onClick={feedbackHandler}>
                Feedback
              </button> */}
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
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Click to Check the PDF Report</h1>
            <button className="button" onClick={backtoStart}>
              {' '}
              Close
            </button>
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
                        {r.split('/')[1]}
                      </label>
                    </p>
                  );
                })}


            </div>
          </div>
          <div></div>
        </div>
      ) : null}


      <Footer />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </div>
  );
}

export default RecorderPage;
