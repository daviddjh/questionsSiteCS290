Handlebars.registerHelper('convertTag', function(a){
  if (a === "sports"){
    return "Sports";
  } else if (a == "animals"){
    return "Animals";
  } else if (a == "news"){
    return "News";
  } else if (a == "politics"){
    return "Politics";
  } else if (a == "gaming"){
    return "Gaming";
  }
});

function insertComment(commentText, commentAuthor ) {

  var commentData = {
    text: commentText,
    userID: commentAuthor,
  }

  var request = new XMLHttpRequest();
  request.open('POST', window.location.pathname + '/addComment');
  var requestBody = JSON.stringify(commentData);
  console.log(requestBody);
  request.setRequestHeader(
    'Content-Type', 'application/json'
  );

  request.addEventListener('load', function(event){
    if(event.target.status != 200){
      var message = event.target.response;
      alert(message);
    } else {

    var commentTemplate= Handlebars.templates.comment;
    var newCommentHtml = commentTemplate(commentData);

    var noCommentsAlert =  document.getElementById('no-comments');
    if(noCommentsAlert){
        noCommentsAlert.classList.add('hidden');
    }

    var questionContainer = document.querySelector('div.Comment-Container');
    questionContainer.insertAdjacentHTML('beforeend', newCommentHtml);

    }
  });

  request.send(requestBody);
}

function handleModalAcceptClick() {

  var commentAuthor = document.getElementById('author-text-input').value;
  var commentText = document.getElementById('comment-text-input').value;

  if (commentText && commentAuthor ) {
      
    insertComment(commentText, commentAuthor);

    hideNewCommentModal();

  } else {

    alert('You must specify both the text and the author of the question!');

  }
}

var qmodalBack = document.getElementById("modal-backdrop");
var qmodalScreen = document.getElementById("create-comment-modal");

function clearNewCommentModal(){
  var commentText = document.getElementById('comment-text-input');
  var commentAuthor = document.getElementById('author-text-input');

  commentAuthor.value = '';
  commentText.value = '';
  
}

function unhideNewCommentModal(){

  qmodalBack.classList.remove('hidden');
  qmodalScreen.classList.remove('hidden');
  /*
  qmodalBack.style.display = "block";
  qmodalScreen.style.display = "block";
  */

}

function hideNewCommentModal(){

  qmodalBack.classList.add('hidden');
  qmodalScreen.classList.add('hidden');
  /*
  qmodalBack.style.display = "none";
  qmodalScreen.style.display = "none";
  */

  clearNewCommentModal();

}


var createcomment = document.getElementById("create-comment-button");
createcomment.addEventListener('click', function(event) {
  console.log("== The create comment button was clicked");

  unhideNewCommentModal();


});

var modelReturn = document.getElementsByClassName("modal-return-button")[0];
modelReturn.addEventListener('click', function(event) {
  console.log("== The close modal button was clicked");

  hideNewCommentModal();

});

var modelClose = document.getElementsByClassName("modal-close-button")[0];
modelClose.addEventListener('click', function(event) {
  console.log("== The close modal button was clicked");

  hideNewCommentModal();

});

var modelAccept = document.getElementsByClassName("modal-add-button")[0];
modelAccept.addEventListener('click', handleModalAcceptClick);