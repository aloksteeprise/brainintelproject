import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';

const StyledInput = styled(TextField)`
& .MuiOutlinedInput-notchedOutline {
  border-color: #333e5b57;
  color: #333E5B;
}
& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
  border-color: #333e5b57;
  color: #333E5B!important;
}
& .MuiOutlinedInput-root .Mui-focused  {
    color:'red;
}
`;

export default StyledInput;