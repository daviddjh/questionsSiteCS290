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

var tags = document.getElementsByClassName('tagCheck');
for (tagCheck of tags){
  tagCheck.addEventListener('change', function(){
    if(this.checked){

      for (tag of tags){
        if (tag != this){
          tag.checked = false;
        }

      }

    }
  })
}

function insertQuestion(questionTitle, questionText, questionAuthor, tagsChecked) {

  var questionData = {
    title: questionTitle,
    text: questionText,
    userID: questionAuthor,
    tag: tagsChecked
  }

  var request = new XMLHttpRequest();
  request.open('POST', '/addPost');
  var requestBody = JSON.stringify(questionData);
  console.log(requestBody);
  request.setRequestHeader(
    'Content-Type', 'application/json'
  );

  request.addEventListener('load', function(event){
    var message = event.target.response;
    if(event.target.status != 200){
      alert(message);
    } else {

    console.log(message);
    console.log(typeof message);
    questionData._id = message.replace(/\"/g, "");

    var questionTemplate = Handlebars.templates.post;
    var newQuestionHtml = questionTemplate(questionData);

    var noPostsAlert =  document.getElementById('no-posts');
    if(noPostsAlert){
        noPostsAlert.classList.add('hidden');
    }

    var questionContainer = document.querySelector('main.Question-Container');
    questionContainer.insertAdjacentHTML('afterbegin', newQuestionHtml);

    }
  });

  request.send(requestBody);
}

function handleModalAcceptClick() {

  var questionTitle = document.getElementById('question-title-input').value;
  var questionText = document.getElementById('question-text-input').value;
  var questionAuthor = document.getElementById('question-author-input').value;
  var tagsChecked = [];
  if(tags){
    for (i = 0; i < tags.length; i++){
      if(tags[i].checked){
        tagsChecked.push(tags[i].value);
      }
    }
  }

  if (questionText && questionAuthor && questionTitle && tagsChecked.length > 0) {
    //api stuff

    console.log(tagsChecked);
    insertQuestion(questionTitle, questionText, questionAuthor, tagsChecked);

    hideNewPostModal();

  } else {

    alert('You must specify every field!');

  }
}

var qmodalBack = document.getElementById("modal-backdrop");
var qmodalScreen = document.getElementById("create-question-modal");

function clearNewPostModal(){
  var questionTitle = document.getElementById('question-title-input');
  var questionText = document.getElementById('question-text-input');
  var questionAuthor = document.getElementById('question-author-input');

  questionAuthor.value = '';
  questionText.value = '';
  questionTitle.value = '';

  for (tag of tags){
    tag.checked = false;
  }
}
function unhideNewPostModal(){

  qmodalBack.classList.remove('hidden');
  qmodalScreen.classList.remove('hidden');
  /*
  qmodalBack.style.display = "block";
  qmodalScreen.style.display = "block";
  */

}

function hideNewPostModal(){

  qmodalBack.classList.add('hidden');
  qmodalScreen.classList.add('hidden');
  /*
  qmodalBack.style.display = "none";
  qmodalScreen.style.display = "none";
  */

  clearNewPostModal();

}


var createquestion = document.getElementById("create-question-button");
createquestion.addEventListener('click', function(event) {
  console.log("== The create question button was clicked");

  unhideNewPostModal();


});

var modelReturn = document.getElementsByClassName("modal-return-button")[0];
modelReturn.addEventListener('click', function(event) {
  console.log("== The close modal button was clicked");

  hideNewPostModal();

});

var modelClose = document.getElementsByClassName("modal-close-button")[0];
modelClose.addEventListener('click', function(event) {
  console.log("== The close modal button was clicked");

  hideNewPostModal();

});

var modelAccept = document.getElementsByClassName("modal-add-button")[0];
modelAccept.addEventListener('click', handleModalAcceptClick);