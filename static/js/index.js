const loginField = document.getElementsByClassName('login')[0]
const signUpField = document.getElementsByClassName('login')[1]
// loginField.style.visibility = "hidden";
document.getElementById('login-btn').addEventListener('click', function() {
    loginField.classList.toggle('fade')
    signUpField.classList.add('fade')
})
document.getElementById('signup-btn').addEventListener('click', function() {
    signUpField.classList.toggle('fade')
    loginField.classList.add('fade')
});
timeago.render(document.querySelectorAll('.need_to_be_rendered'));
