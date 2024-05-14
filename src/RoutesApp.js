import { Route, Routes } from "react-router-dom";
import Login from "./component/User/Login";
import RecorderPage from "./component/Recorder/Recorderpage";
import ResetPassword from "./component/User/ResetPassword";


const RoutesApp = () => {
    return (
        <div className="app">
          <Routes> 
          
            <Route path="/" element={<Login/>} />
            <Route path="/record" element={<RecorderPage/>}/>
            <Route exact path="/login/?token=:token" element={<ResetPassword/>} />

          </Routes>
        </div>
    );
  };

  export default RoutesApp;