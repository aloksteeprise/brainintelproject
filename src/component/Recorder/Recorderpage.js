/*
Reference :: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API
*/

import './RecorderPage.scss';
import { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import Header from '../Header/Header';
import Footer from './Footer.js';
import jsPDF from 'jspdf';
import { handlerLogs, submitFeedback, handleFetchUserAttributes, latestUserAttributes,submitLoginUserAttributeFeedback } from '../../service/Authservice';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Tooltip } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import { array } from 'prop-types';
import { red } from '@mui/material/colors';
// import pdf from '../../../src/document/consent.pdf'
let mediaRecorder;
let audioCtx;

function RecorderPage() {

  const [feedbackValue, setFeedbackValue] = useState('');
  const [feedbackbuttonenable,setFeedbackButtonEnable ] =useState(false)
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackfilename, setFeedbackFilename] = useState("")
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [attributes, setAttributes] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [userfeedbackcount, setUserFeedbackcount] = useState("0")
  const [latesfeedbackcount, setLatestFeedbackcount] = useState("")
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
    feedbacktable: false,
    headingvisible: false

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
      feedbacktable: false,
      headingvisible: false
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

  const feedbackHandler = async () => {
    //const userInfo = getUserInfo();
    //let id = userInfo?.userId;
    // const folderName = getUserFolderName();
    //const pdfCount = await s3.listAndCountFiles(albumBucketName, folderName);
    //const pdfCount = await listAndCountFiles('', folderName);

    //const pdfCount =  s3.listAndCountFiles({ Prefix: folderName });
    let sortedContents = 0;
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
          if (val.Key && val.Key.endsWith('.pdf')) {
            r.push(val.Key);
          }
        });
        if (r.length) {
          fetchFeedbackStatus();
          setFeedbackValue("")
          setState(prevState => ({
            ...prevState,
            feedbackVisible: true, // Show feedback section
            submitted: false, // Hide main content
            startAnalysis: false,
            recording: false,
            completed: false,
            headingvisible: true

          }));
        }
       
        else {

          alert('There is no files for feedback.')
        }
      }
    });







  };

  useEffect(() => {
    checkuserloginuser();

  }, []);

  const checkuserloginuser = async () => {

    const loginUserAttribute = await handleFetchUserAttributes();
    debugger;
    if (loginUserAttribute != null) {

      if ("family_name" in loginUserAttribute) {
        console.log("yes")
        if(loginUserAttribute.family_name !="0"){
          setFeedbackButtonEnable(true)
        }
    
      }
      else {
        console.log("no")
        setFeedbackButtonEnable(false);
         submitLoginUserAttributeFeedback('0');
      }
      
    }
  }

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


  // const submitHandler = () => {
  //   let name = getFileName();
  //   const folderName = getUserFolderName();
  //   var params = {
  //     Body: state.audioFile,
  //     Bucket: albumBucketName,
  //     Key: `${folderName}/${name + '.wav'}`,
  //     // Key: name + '.wav',
  //   };
  //   s3.putObject(params, function (err, data) {
  //     if (err) {
  //       handlerLogs(`submitHandler > ` + err.stack);
  //     } else {
  //       setFeedbackFilename(name);
  //      
  //       setUserFeedbackcount("0")
  //       handlerLogs(`submitHandler > ` + 'success');

  //       // createPdf(folderName,name)
  //     }
  //   });
  //   setState((state) => ({
  //     ...state,
  //     completed: false,
  //     submitted: true,
  //   }));
  // };


  const submitHandler = async () => {
    let name = getFileName();
    const folderName = getUserFolderName();
    var params = {
      Body: state.audioFile,
      Bucket: albumBucketName,
      Key: `${folderName}/${name + '.wav'}`,
    };

    s3.putObject(params, async function (err, data) {
      if (err) {
        handlerLogs(`submitHandler > ` + err.stack);
      } else {
        setFeedbackButtonEnable(false);
        setTimeout(function(){ 
        setFeedbackButtonEnable(true)
        submitLoginUserAttributeFeedback('1');
      },10000)
        setFeedbackFilename(name);

        await submitFeedback("", "0");
        
        handlerLogs(`submitHandler > ` + 'success');
        //checkuserloginuser();
       
      }
    });

    setState((state) => ({
      ...state,
      completed: false,
      submitted: true,

    }));
  };


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

  const getLatestWavFile = async (bucketName, prefix) => {
    const params = {
      Bucket: albumBucketName,
      Prefix: prefix
    };
  
    try {
      // List objects in the bucket with the specified prefix
      const data = await s3.listObjectsV2(params).promise();
      
      // Filter WAV files
      const wavFiles = data.Contents.filter(item => item.Key.endsWith('.wav'));
  
      // Sort by LastModified date in descending order
      wavFiles.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
  
      // Return the date and time part of the latest WAV file without the .wav extension
      if (wavFiles.length > 0) {
        const latestFileName = wavFiles[0].Key.split('/').pop();
        const dateAndTimePart = latestFileName.split('_').slice(1).join('_').replace('.wav', ''); // Extract date and time part and remove .wav
        return dateAndTimePart;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error listing objects:', error);
      return null; // Return null if there's an error
    }
  };
  
  
  

  const submitfeedbackhandler = async () => {
    const userInfo = getUserInfo();
    const id = userInfo?.userId;
    const folderName = getUserFolderName();
    console.log(id);
    
    // Get the latest WAV file with only the date and time part
    const latestWavFile = await getLatestWavFile(albumBucketName, folderName);
  
    if (!latestWavFile) {
      setFeedbackError("No WAV file found");
      return;
    }
  
    const inputValue = latestWavFile + '-' + feedbackValue;
  
    if (!feedbackValue) {
      setFeedbackError("Feedback % not selected");
      return;
    }
  
    setUserFeedbackcount("1");
    console.log(inputValue, "Akash2");
  
    let result = await submitFeedback(inputValue, "1");
    setSnackbarMessage(result.message);
    setSnackbarOpen(true);
    setChecked(false);
  
    setState((state) => ({
      ...state,
      completed: false,
      startAnalysis: true,
      feedbacktable: false,
      feedbackVisible: false,
      headingvisible: false
    }));
  };
  
  
  



  // useEffect(() => {
  //   const fetchFeedbackStatus = async () => {
  //     try {
  //       const userAttributes = await latestUserAttributes();
  //       const feedbackStatus = userAttributes['custom:LatestFeedback'];
  //       setLatestFeedbackcount(feedbackStatus);
  //       console.log('Latest Feedback Value:', feedbackStatus); // Log the value

  //       // Hide feedback section if feedbackStatus is 1
  //       if (feedbackStatus === "1") {
  //         setState((prevState) => ({ ...prevState, feedbackVisible: false }));
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user attributes:', error);
  //     }
  //   };

  //   fetchFeedbackStatus();
  // }, []);


  // const fetchFeedbackStatus = async () => {
  //   try {
  //     const userAttributes = await latestUserAttributes();
  //     console.log(userAttributes)
  //     setLatestFeedbackcount(userAttributes);

  //     const feedbackString = userAttributes['custom:Userfeedback'];
  //     const feedbackStatus = userAttributes['custom:LatestFeedback'];
  //     if (feedbackStatus === "1") {
  //       setState((prevState) => ({ ...prevState, feedbackVisible: false }));
  //     }
  //     const email = userAttributes['email'];
  //     const emailPrefix = email.split('@')[0];

  //     const feedbackEntries = formatteddate.split(';').filter(entry => entry !== "");
  //   
  //     const processedFeedbackData = feedbackEntries.map(entry => {
  //       const [customFeedback, percentage] = entry.split('-');
  //       return {
  //         customFeedback: `${emailPrefix}_${customFeedback}`,
  //         percentage
  //       };
  //     });
  //     setFeedbackData(processedFeedbackData);

  //     if (feedbackStatus === "1") {
  //       setState(prevState => ({ ...prevState, feedbackVisible: false, feedbacktable: true,headingvisible:true }));
  //     } else {
  //       setState(prevState => ({ ...prevState, feedbackVisible: true, feedbacktable: true,headingvisible:true }));
  //     }


  //   } catch (error) {
  //     console.error('Error fetching user attributes:', error);
  //   }
  // };

  const fetchFeedbackStatus = async () => {
    try {
      const userAttributes = await latestUserAttributes();
      console.log(userAttributes);
      setLatestFeedbackcount(userAttributes);

      const feedbackString = userAttributes['custom:Userfeedback'];
      const feedbackStatus = userAttributes['custom:LatestFeedback'];
      // if (feedbackStatus === "1") {
      //   setState((prevState) => ({ ...prevState, feedbackVisible: false }));
      // }
      // if (!feedbackString) {
      //   setState(prevState => ({ ...prevState, feedbackVisible: false,headingvisible:true }));
      //   return; 
      // }
      const email = userAttributes['email'];
      const emailPrefix = email.split('@')[0];

      const feedbackEntries = feedbackString.split(';').filter(entry => entry !== "");

      const processedFeedbackData = feedbackEntries.map(entry => {
        const [customFeedback, percentage] = entry.split('-');
        const timestamp = customFeedback;
        // console.log(timestamp)
        return {
          customFeedback: `${emailPrefix}_${customFeedback}`,
          percentage,
          timestamp
        };
      });


      const sortedFeedbackData = processedFeedbackData.sort((a, b) => {

        const dateA = convertTimestamp(a.timestamp);
        const dateB = convertTimestamp(b.timestamp);
        return dateB - dateA;
      });

      setFeedbackData(sortedFeedbackData);

      if (feedbackStatus === "1") {
        setState(prevState => ({ ...prevState, feedbackVisible: false, feedbacktable: true, headingvisible: true }));
      } else {
        setState(prevState => ({ ...prevState, feedbackVisible: true, feedbacktable: true, headingvisible: true }));
      }
    } catch (error) {
      console.error('Error fetching user attributes:', error);
    }
  };

  // useEffect(() => {
  //   fetchFeedbackStatus();
  // }, []);

  const convertTimestamp = (timestamp) => {
    if (!timestamp) {

      return null;
    }
    const [datePart, timePart] = timestamp.split('_');

    const day = parseInt(datePart.slice(0, 2), 10);
    const month = parseInt(datePart.slice(2, 4), 10) - 1; // months are 0-based
    const year = parseInt(datePart.slice(4, 6), 10); // Assuming year is in 2000s
    const hour = parseInt(timePart.slice(0, 2), 10);
    const minute = parseInt(timePart.slice(2, 4), 10);
    const second = parseInt(timePart.slice(4, 6), 10);
    const dateObject = new Date(year, month, day, hour, minute, second);
    // console.log(dateObject,"Akash")
    return dateObject;
  };




  const getFeedbackValue = (feedback) => {
    if (feedback) {
      const parts = feedback.split('-');
      return parts.length > 1 ? parts[1] : 'N/A';
    }
    return 'N/A';
  };


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
    setState((state) => ({ ...state, completed: false, view: true, startAnalysis: false, submitted: false, recording: false, }));
  };



  const backtoStart = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true }));
    setChecked(false)
  };

  const backtoTable = () => {
    setState((state) => ({ ...state, view: false, startAnalysis: true, headingvisible:false,feedbacktable:false }));
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

  const ReportActivity = () => {
    checkResults()

  }

  return (
    <div className="App" style={{ paddingBottom: '80px', overflowY: 'auto' }}>

      < Header checkResults={checkResults} feedbackHandler={feedbackHandler} />
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

            <button className="button-secondary" onClick={checkResults}>
              Reports
            </button>
            <br />


          {feedbackbuttonenable?( <button className="button" onClick={feedbackHandler} style={{ margin: "20px auto" }}>
              Feedback
            </button>) :null}
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
                Reports
              </button> */}

              <button className="button" onClick={submitHandler}>
                Submit for pdf report generation
              </button>


            </div>

          </div>
          <div></div>
        </div>
      ) : null}

      {/* {latesfeedbackcount === "1" && (
        <div>
          <p>Feedback has been submitted</p>
        </div>
      )} */}
      {state.headingvisible && (


        <h1 component="legend" className="head">Feedback on Report</h1>
      )}




      {state.feedbackVisible && (
        <div className="feedback-section" >
          <FormControl component="fieldset">

            <RadioGroup
              aria-label="feedback"
              name="feedback"
              value={feedbackValue}

              onChange={handleFeedbackChange}
              row
            >
              <FormControlLabel value="20" control={<Radio />} label="20%" />
              <FormControlLabel value="40" control={<Radio />} label="40%" />
              <FormControlLabel value="60" control={<Radio />} label="60%" />
              <FormControlLabel value="80" control={<Radio />} label="80%" />
            </RadioGroup>
            {feedbackError && <p className="error" style={{ color: "red" }}>{feedbackError}</p>}
          </FormControl>

          <button className="button" onClick={submitfeedbackhandler}>
            Submit
          </button>

        </div>
      )}

      {state.feedbacktable && (
        <div >
          {/* <h3>Feedback Table</h3> */}
          <div style={{ display: "flex", justifyContent: "center" }}>

            <table className='table table-striped table-bordered table-hover'>
              <thead className="thead-dark">
                <tr>
                  <th>Report</th>
                  <th>Satisfaction Level</th>
                </tr>
              </thead>
              <tbody>
                {feedbackData.map((feedback, index) => (
                  <tr key={index}>
                    <td>{feedback.customFeedback}</td>
                    <td>{feedback.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="button" onClick={backtoTable}>
              {' '}
              Close
            </button>
        </div>
        
      )}



      {/* 4th page */}
      {state.submitted ? (
        <div className="main-div" >
          <div></div>
          <div className="first">
            <h1 className="head">Check Your Reports</h1>
            <div className="para">
              Wait for 10 minutes for the report.
            </div>
            <button className="button" onClick={checkResults} style={{ marginTop: "10px" }}>
              Reports
            </button>
            {feedbackbuttonenable?( <button className="button-secondary" onClick={feedbackHandler} style={{ margin: "20px auto" }}>
              Feedback
            </button>) :null}


            <button className="button" onClick={closeHandler} style={{ marginTop: "41px" }}>
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
