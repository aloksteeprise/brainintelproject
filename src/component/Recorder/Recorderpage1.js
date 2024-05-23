import { React, useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import logo from '../logo.svg';
import { v4 as uuid } from "uuid";
import { AudioRecorder } from 'react-audio-voice-recorder'; // Import the AudioRecorder component
import { Amplify } from 'aws-amplify';
import AWS from "aws-sdk";
AWS.config.update({
    accessKeyId: 'AKIATZJIQJPCSOHHC4WG',
    secretAccessKey: '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',
    region: 'ap-south-1',
  });

const RecorderPage = () => {
    const folderName1='alok.singh@steeprise.com' 
    const navigate = useNavigate();
    const [classNameShowHide, setclassNameShowHide] = useState('d-flex align-items-center justify-content-center hidediv');
    const [classNameDivContent, setclassNameDivContent] = useState('d-flex align-items-center justify-content-center showbutton');
    const [classMicBtn, setclassMicBtn] = useState('col-md-12 showMicbutton');
    const signInPage = () => {
        navigate("/signin");
    };
    const addAudioElement = (blob) => {
        const url = URL.createObjectURL(blob);
        const audio = document.createElement("audio");
        audio.src = url;
        audio.controls = true;
        setclassNameDivContent('col-md-12 hidebutton');
        document.getElementById("myrecords").appendChild(audio); // Append audio element to the local d
        const blobUrl = URL.createObjectURL(blob)
        const unique_id = uuid();
        const small_id = unique_id.slice(0, 15);
        const extension = 'wav' 
        const file = new File([blob], `${small_id}.${extension}`, { type: blob.type });
        setFile(file);
        setclassNameShowHide('d-flex align-items-center justify-content-center showdiv');
        setclassMicBtn('col-md-12 hideMicbutton')

    };

    const [file, setFile] = useState(null);
    // Function to upload file to s3
    const uploadFile = async () => {
        // S3 Bucket Name
        const S3_BUCKET = "amplify-brainintelproject-dev-50421-deployment";
        // S3 Region
        const REGION = "ap-south-1";
        // S3 Credentials
        AWS.config.update({
            accessKeyId: "AKIATZJIQJPCSOHHC4WG",
            secretAccessKey: "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",
        });
        const s3 = new AWS.S3({
            params: { Bucket: S3_BUCKET },
            region: REGION,
        });
        // Files Parameters
        
        const params = {
            Bucket: S3_BUCKET,
            // Key: file.name,
            Key: `${folderName1}/${file.name}`,
            Body: file,
        };
        // Uploading file to s3
        var upload = s3
            .putObject(params)
            .on("httpUploadProgress", (evt) => {
                // File uploading progress
                console.log(
                    "Uploading " + parseInt((evt.loaded * 100) / evt.total) + "%"
                );
            })
            .promise();
        await upload.then((err, data) => {
            console.log(err);
            // Fille successfully uploaded
            alert("File uploaded successfully.");
            setFile(file);
        });
    };
    // Function to handle file and store it to file state
    const handleFileChange = (e) => {
        // Uploaded file
        const file = e.target.files[0];
        // Changing file state
        setFile(file);
    };
    const removeRecording = (e) => {
        setclassNameShowHide('col-md-12 hidediv');
        setclassNameDivContent('col-md-12 showbutton');
        setclassMicBtn('col-md-12 showMicbutton')
        setFile('');
        const list = document.getElementById("myrecords");
        list.removeChild(list.firstElementChild);
    };

    const [s3Files, s3SetFiles] = useState([]);
    useEffect(() => {
        // Initialize AWS SDK
        AWS.config.update({
          accessKeyId: 'AKIATZJIQJPCSOHHC4WG',
          secretAccessKey: '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',
          region: 'ap-south-1',
        });
        const s3 = new AWS.S3();
        const params = {
            Bucket: 'amplify-brainintelproject-dev-50421-deployment/${identityId}',
           
          };
          s3.listObjects(params, (err, data) => {
            if (err) {
              console.error('Error', err);
            } else {
              console.log('Success', data);
              // Extract file keys from the response
              const fileKeys = data.Contents.map((file) => file.Key);
              s3SetFiles(fileKeys);
            }
          });
        }, []);

        const downloadFile = (fileKey) => {
            // Initialize AWS SDK
            AWS.config.update({
              accessKeyId: 'AKIATZJIQJPCSOHHC4WG',
              secretAccessKey: '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',
              region: 'ap-south-1',
            });
        
            const s3 = new AWS.S3();
        
            // Parameters for downloading object
            const params = {
              Bucket: 'amplify-brainintelproject-dev-50421-deployment',
              Key: fileKey,
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
          const deleteFile = (fileKey) => {
            // Initialize AWS SDK
            AWS.config.update({
              accessKeyId: 'AKIATZJIQJPCSOHHC4WG',
              secretAccessKey: '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',
              region: 'ap-south-1',
            });
        
            const s3 = new AWS.S3();
        
            // Parameters for deleting object
            const params = {
              Bucket: 'amplify-brainintelproject-dev-50421-deployment',
              Key: fileKey,
            };
        
            // Delete the object from the bucket
            s3.deleteObject(params, (err, data) => {
              if (err) {
                console.error('Error', err);
              } else {
                console.log('Success', data);
                // Update the file list after deletion
                s3SetFiles(s3Files.filter((file) => file !== fileKey));
              }
            });
          };

          const s3 = new AWS.S3();
          const createBucket = (bucketName) => {
            return new Promise((resolve, reject) => {
              const params = {
                Bucket: bucketName,
                ACL: 'public-read' // Set the bucket ACL as per your requirement
              };
          
              s3.createBucket(params, (err, data) => {
                if (err) {
                  console.error('Error creating bucket:', err);
                  reject(err);
                } else {
                  console.log('Bucket created successfully:', data);
                  resolve(data);
                }
              });
            });
          };

          const handleCreateBucketName = () => {
            createBucket('suniltest1');
          }; 
    return (
        <div className="">
            <header>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    {/* <a className="navbar-brand" href="#"><img src={logo} className='App-logo' alt='logo' /></a> */}
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item active">
                                <a className="nav-link" href="#">Home </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" onClick={signInPage}>Signout</a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>

            <main>
                <div className="container">
                    <div className="row">
                        <div className='col-md-12'>
                            <div className={classNameDivContent}>
                                It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.
                            </div>
                            <div className={classMicBtn} >
                                <div className='d-flex align-items-center justify-content-center'>
                                {/* AudioRecorder will be rendered here */}
                                <AudioRecorder
                                    onRecordingComplete={addAudioElement}
                                    audioTrackConstraints={{
                                        noiseSuppression: true,
                                        echoCancellation: true,
                                    }}
                                    downloadOnSavePress={false}
                                    downloadFileExtension="webm"
                                />
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-center" id="myrecords">

                            </div>
                            <div className={classNameShowHide}>
                                <div className='d-flex align-items-center justify-content-center'>
                                <button type="button" onClick={uploadFile} className="btn btn-outline-primary">Save</button>&nbsp;
                                <button type="button" onClick={removeRecording} className="btn btn-outline-secondary">Cancel</button>
                            </div>
                            </div>
                            <div className='col-md-12'>
                            <button type="button" onClick={handleCreateBucketName} className="btn btn-outline-secondary">Create Bucket</button>
                                <h3>Files in S3 amplify-brainintelproject-dev-50421-deployment</h3>
                                <ul>
                                {s3Files.map((file, index) => (
                                    <li key={index}>
                                    {file}
                                    <button type="button button-spacing" class="btn btn-info" onClick={() => downloadFile(file)}>Download</button> 
                                    <button type="button button-spacing" class="btn btn-danger" onClick={() => deleteFile(file)}>Delete</button>
                                    </li>
                                ))}
                                </ul>
                                </div>
                            
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                {/* <p>&copy; {new Date().getFullYear()} Your Company</p> */}
            </footer>
        </div>
    );
};

export default RecorderPage;
