// Select all elements with the class name
const en_elements = document.getElementsByClassName('en'); 
const mg_elements = document.getElementsByClassName('mg'); 
const fr_elements = document.getElementsByClassName('fr'); 

// Loop through the elements and apply changes 
function toggle(elements, style) { // elements_list, 'block'
  //console.log("elem length: " + elements.length);
  
  for (let i = 0; i < elements.length; i++) { 
    elements[i].style.display = style; 
  }
}

select_en.addEventListener("click", (e) => {
  toggle(en_elements, 'block');
  toggle(mg_elements, 'none');  
  toggle(fr_elements, 'none');
  //console.log("en clicked");
});

select_mg.addEventListener("click", (e) => {
  toggle(en_elements, 'none');
  toggle(mg_elements, 'block');  
  toggle(fr_elements, 'none');
  //console.log("mg clicked");
});

select_fr.addEventListener("click", (e) => {
  toggle(en_elements, 'none');
  toggle(mg_elements, 'none');  
  toggle(fr_elements, 'block');
  //console.log("fr clicked");
});

