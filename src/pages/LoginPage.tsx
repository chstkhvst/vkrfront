import React, { useState } from "react"
import { Box, Button } from "@mui/material"
import LoginModal from "../components/LoginModal";
import { useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [open, setOpen] = useState(true);

  return (
    <Box>
      <LoginModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </Box>
  );
};
export default LoginPage
