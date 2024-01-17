const menuBtn = document.getElementById('menu-btn')
const aside = document.getElementById('aside-menu')
const menuItems = document.getElementById('menu-page')
const logoutBtn = document.getElementById('l-out-btn')

menuBtn.addEventListener('click',()=>{   
    if(menuItems.style.display == "none"){
        menuItems.style.display = "block" 
        aside.style.width = '60vw'
        aside.style.backgroundColor = 'white'
        aside.style.position = 'absolute'
        aside.style.height = 'fit-content'
        logoutBtn.style.display = "block"
    }else{
        menuItems.style.display = "none"
        aside.style.width = 'fit-content'
        aside.style.position = 'relative'
        aside.style.height = '85vh'
        logoutBtn.style.display = "none"
    }
})