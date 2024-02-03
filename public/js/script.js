
const aside = document.getElementById('aside-menu')
const menuItems = document.getElementById('menu-page')
const logoutBtn = document.getElementById('l-out-btn')

const asideShow = ()=>{   
    if(menuItems.style.display == "none"){
        menuItems.style.display = "block" 
        aside.style.width = '60vw'
        aside.style.backgroundColor = 'white'
        aside.style.position = 'absolute'
        // aside.style.height = 'fit-content'
        logoutBtn.style.display = "block"
    }else{
        menuItems.style.display = "none"
        aside.style.width = 'fit-content'
        aside.style.position = 'relative'
        // aside.style.height = '85vh'
        logoutBtn.style.display = "none"
    }
}

const passwordInput = document.getElementById('password-inp')
function showPass (){  
    passwordInput.getAttribute('type') === 'password' ? passwordInput.setAttribute('type','text') : passwordInput.setAttribute('type','password')
}

// document.addEventListener("DOMContentLoaded", function () {
//     const checkboxes = document.querySelectorAll('input[type="checkbox"]');
//     checkboxes.forEach(checkbox => {
//         checkbox.addEventListener('change', function () {
//             document.getElementById('filterForm').submit()
//         })
//     })
// })