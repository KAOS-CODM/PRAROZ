const password=document.getElementById('password');
const toggle=document.getElementById('togglePassword');
toggle.addEventListener("click", () => {
  password.type=password.type==='password'?'text':'password';
  toggle.textContent=password.type==='password'?'👁':'🙈';
});

const toast=document.getElementById('toast');
function showToast(message){
  toast.textContent=message;
  toast.className='fixed top-5 right-5 px-5 py-3 rounded-xl shadow-lg text-white bg-rose-600';
  toast.classList.remove('hidden');
  setTimeout(()=>toast.classList.add('hidden'),3000);
}

document.getElementById('login-form').addEventListener('submit',async (e)=>{
  e.preventDefault();
  const btn=document.getElementById('loginBtn');
  btn.disabled=true;
  btn.innerHTML=`<svg class="animate-spin mx-auto h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>`;

  try{
    const res=await fetch(`${window.API_BASE_URL}/validate-admin`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:password.value})});
    const data=await res.json();
    if(res.ok && data.valid && data.token){
      localStorage.setItem('adminToken',data.token);
      window.location.href='/admin';
      return;
    }
    showToast('Invalid password');
  }catch(err){
    showToast('Unable to login');
  }finally{
    btn.disabled=false;
    btn.textContent='Login';
  }
});
