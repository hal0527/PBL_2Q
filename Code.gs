function getTaskLists() {
  var taskLists = Tasks.Tasklists.list().getItems();
//  Logger.log(taskLists);
  if (!taskLists) {
    return [];
  }
  return taskLists.map(function(taskList) {
    return {
      id: taskList.getId(),
      name: taskList.getTitle()
    };
  });
}

function getTasks(taskListId) {
  var tasks = Tasks.Tasks.list(taskListId).getItems();
  if (!tasks) {
    return [];
  }
  return tasks.map(function(task) {
    return {
      id: task.getId(),
      title: task.getTitle(),
      notes: task.getNotes(),
      completed: Boolean(task.getCompleted())
    };
  }).filter(function(task) {
    return task.title;
  });
}

function buildAddOn(e){
  var myTaskLists = getTaskLists();
  var cards =[];
  for (var i=0; i<=myTaskLists.length-1; i++){
    cards.push(buildTaskCard(myTaskLists[i]))
//      card.push(CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle(myTaskLists[j].name)).build())
  }
  return cards;
}

//タスクリストのオブジェクトを投げて、カードにする関数
//タスクリストからタスク名を抽出する
//タスクをforでループさせて並ばせる
//セクションに日付などの実行時間をいれる
function buildTaskCard(tasklistobject){
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle(tasklistobject.name))
  
  var taskObject = getTasks(tasklistobject.id);
  var section = CardService.newCardSection()
  .setHeader("<font color=\"#1257e0\">タスク一覧</font>");
  taskObject.forEach(function(value){
    var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    // .setTitle("A group of checkboxes. Multiple selections are allowed.")
    .setFieldName("checkbox_field")
    .addItem(value.title, value.id, false)
    .setOnChangeAction(CardService.newAction()
                       .setFunctionName("handleCheckboxChange"));
    section.addWidget(checkboxGroup);
  });
  card.addSection(section);
  return card.build();
}

/*
var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle("A group of checkboxes. Multiple selections are allowed.")
    .setFieldName("checkbox_field")
    .addItem("checkbox one title", "checkbox_one_value", false)
    .addItem("checkbox two title", "checkbox_two_value", true)
    .addItem("checkbox three title", "checkbox_three_value", false)
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("handleCheckboxChange"));
        section.addWidget(checkboxGroup);

*/



/*
function buildAddOn1(e){
  var myTaskLists = getTaskLists();
  var card =[];
  for (var j=0; j<=myTaskLists.length-1; j++){
    var item = myTaskLists[j];
    var taskItems = getTasks(myTaskLists[j].id);
    for (var i=0; i<=taskItems.length-1; i++){
      card.push(CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle(taskItems[i].title)).build())
    }
  }
  return card;
}
*/