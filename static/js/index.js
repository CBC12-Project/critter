const loginField = document.getElementById('login-field');
const signupField = document.getElementById('signup-field');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const logoutField = document.getElementById('logout-field');
const searchBtn = document.getElementById('search-btn');
const searchField = document.getElementById('search-field');
// loginBtn eventListener
if (loginBtn) {
    loginBtn.addEventListener('click', function(event) {
        if (loginBtn.contains(event.target) && !(loginField.contains(event.target))) {
            loginField.classList.toggle('fade');
            signupField.classList.add('fade');
            searchField.classList.add('fade');
        }
    })
    signupBtn.addEventListener('click', function(event) {
        if (signupBtn.contains(event.target) && !signupField.contains(event.target)) {
            signupField.classList.toggle('fade');
            loginField.classList.add('fade');
            searchField.classList.add('fade');
        }
        })
}
// logoutBtn eventListener
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(event) {
        logoutField.classList.toggle('fade');
    })
}

// searchBtn eventListener
searchBtn.addEventListener('click', function(event) {
    if (!searchField.contains(event.target)) {
        searchField.classList.toggle('fade');
        signupField.classList.add('fade');
        loginField.classList.add('fade');
    }
})

// fades login/signup/search field when something else is clicked on
document.addEventListener('click', function(event) {
    if (!searchField.classList.contains('fade')) {
        if (!searchField.contains(event.target) && !(searchBtn.contains(event.target))) {
            searchField.classList.add('fade');
        }
    }
    if (loginField) {
        if (!loginField.classList.contains('fade') || !signupField.classList.contains('fade')) {
            // if something other than the login/signup field is clicked on
            if ((!loginField.contains(event.target) && !(loginBtn.contains(event.target)))) {
                if ((!signupField.contains(event.target) && !(signupBtn.contains(event.target)))) {
                    loginField.classList.add('fade');
                    signupField.classList.add('fade');
                }
            }
        }
    } else if (logoutField) {
        if (!logoutField.classList.contains('fade')) {
            if (!logoutField.contains(event.target) && !(logoutBtn.contains(event.target))) {
                    logoutField.classList.add('fade');
                };
            };
    };
});

function require()
    if(document.getElementById("create-crit").value.length == 0)
    {
        alert("Crit is empty!");
        return false;
    };
function require()
    if(document.getElementById("reply-crit").value.length == 0)
    {
        alert("Reply is empty!");
        return false;
    };
