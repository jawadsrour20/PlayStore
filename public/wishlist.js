var deleteButton = document.getElementsByClassName("deleteBtn");

for(var i = 0; i < deleteButton.length; i++) {
    deleteButton[i].onclick = deleteElement;
}

function deleteElement() {
    this.parentNode.parentNode.remove();
}