const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

window.API_BASE_URL = isLocal
    ? "http://127.0.0.1:3000"  // Local server
    : "https://praroz.onrender.com"; 

    window.CLOUDINARY_CLOUD_NAME = "dbdtvd1qj"; 
    window.CLOUDINARY_UPLOAD_PRESET = "PraRoz images"; 
