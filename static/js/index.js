const loginField = document.getElementsByClassName('login')[0]
// loginField.style.visibility = "hidden";
document.getElementById('login-btn').addEventListener('click', function() {
    loginField.classList.toggle('fade')
})

