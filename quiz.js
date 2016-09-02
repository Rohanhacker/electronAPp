var google = require('googleapis');
var googleAuth = require('google-auth-library');


// https://docs.google.com/spreadsheets/d/1U-kOR1u5QQ5AbEDY0TgRuQ2tbSKopER8ZRxBmcivBbY/edit
var dummyQuestions = [];
function main() {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    key:'AIzaSyCJ5Assq_h4eAshZCxpiyNxH-rrwqOFef0',
    spreadsheetId: '1U-kOR1u5QQ5AbEDY0TgRuQ2tbSKopER8ZRxBmcivBbY',
    range: 'A:F',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        let obj = {};
        obj['id'] = i;
        obj['q'] = row[0];
        obj['o'] = row.slice(1,5);
        obj['selected'] = -1;
        obj['shouldbe'] = row[5];
        dummyQuestions.push(obj);
//        console.log(obj);
      }
    }

    for(i=0;i<dummyQuestions.length;i++){
      localforage.setItem('q'+(i+1), dummyQuestions[i], function(err,value){
        if(err) {
          console.log(err);
        }
      });
    }

    function shuffle(array) {
      let currentIndex = array.length, temporaryValue, randomIndex

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
      }

      return array
    }
// todo make this dynamic
    const Q = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11","q12","q13","q14","q15"]
    shuffle(Q)
    const max = 15
    let count = 0

    loadQuestion(count);
    loadQuestionLinks();

    function loadQuestionLinks(){
      var str="";
      for(i=0;i<max;i++){
        str+= `<a class="btn-floating waves-effect waves-light btn q-jump green accent-4" data-id="${i}">${i}</a>`;
      }
      $(".q-jump-container").html(str);
    }

    const nextQuestion = function() {
      count = (count+1)%max
      loadQuestion(count);
    }
    const prevQuestion = function(){
      count = (count+max-1)%max
      loadQuestion(count);
    }

    function loadQuestion(count){
      localforage.getItem(Q[count], function(err, value) {
        $(".q-jump").removeClass("green")
        $(".q-jump[data-id="+count+"]").addClass("green")
        $(".question-content").html(value.q);
        var qContainer = $("#q-options");
        var options = value.o;
        let optionStr="";
        for(i=0;i<options.length;i++){
          let str="";
//          console.log(value.selected);
          if(value.selected == i+1) {
            str="checked";
          }
           optionStr += `
            <li class="collection-item">
              <input type="radio" class="option" name="options" value="${i+1}" id="option${i+1}" ${str}  />
              <label for="option${i+1}" >${options[i]}</label>
            </li>
          `;
        }
        qContainer.html(optionStr);
      });
    }

    $(".nxt").click(() => {
      nextQuestion();
    });

    $(".prev").click(() => {
      prevQuestion();
    });

    $(".q-jump").click(function(){
      var id = $(this).data('id');
      count = id;
      loadQuestion(id);
      return ;
    });

    $(".answers").on('click','.option',()=>{
      localforage.getItem(Q[count],(err,value) => {
        value.selected = $(".option:checked").val()
  //      console.log($(".option:checked").val());
        localforage.setItem(Q[count],value,(err,value) => {
          if(err) {
    //        console.log(err);
          }
    //      console.log(value);
        })
      })
    //  console.log(count + ' changed');
    });

    $(".submit-btn").click(() => {
      window.location = "results.html";
    })

  });
}
main();

$("#timer").timer({
    countdown: true,
    duration: '15ms',
    format: '%H:%M:%S',
    callback: function() {
        window.location = "results.html"
    }
});
