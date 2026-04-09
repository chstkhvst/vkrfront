import React, { useState } from "react"
import { Box } from "@mui/material"
import LoginModal from "../components/LoginModal";

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
