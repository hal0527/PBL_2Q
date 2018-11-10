function buildAddOn(e) {
  var taskList = taskListData();
  var cards = [];
  if (taskList.length > 0) {
    taskList.forEach(function(listDate) {
      cards.push(buildRecentThreadCard(listDate));
    });
  } else {
    cards.push(CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader()
        .setTitle('No recent threads from this sender')).build());
  }
  return cards;
}

function taskListData() {
  var taskLists = Tasks.Tasklists.list().getItems();
  var recents = [];
  taskLists.forEach(function(taskList) {
      recents.push({ 
          'id': taskList.getId(),
          'name': taskList.getTitle(),
          'link': taskList.getSelfLink()
      });
    });
  return recents;
}

function taskData(listDateID){
  var tasks = Tasks.Tasks.list(listDateID).getItems();
  var recents = [];
  var num = 1;
  tasks.forEach(function(task) {
    var taskNum = "test_"+num;
    recents.push({
      'num': taskNum,
      'id': task.getId(),
      'name': task.getTitle(),
      'status': task.getStatus(),
      'checked': false
    });
      
   num++;
  });
  return recents;
}

function buildRecentThreadCard(listDate){
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    'list_1': 'null',
    'list_2': 'null',
    'list_3': 'null'
  });
  var taskDate = taskData(listDate.id);
  var card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle(listDate.name));
  var section = CardService.newCardSection();
  
  if (taskDate) {
    for (var a = 0; a < taskDate.length; a++) {
      var taskDate1 = taskDate[a];
      if(taskDate1.status == 'needsAction'){
        var checkboxGroup = CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.CHECK_BOX)
        .setFieldName('test') //taskDate1.num
        .addItem(taskDate1.name, taskDate1.name, false)
        .setOnChangeAction(CardService.newAction()
                           .setFunctionName("checkChange"));
        section.addWidget(checkboxGroup);
      } 
    }
  }
  //section.addWidget(checkboxGroup);
  var date = Utilities.formatDate(new Date(), "JST", "MMMMM d',' yyyy ");
  var dropdownGroup = CardService.newSelectionInput()
  .setType(CardService.SelectionInputType.DROPDOWN)
  .setTitle('日付け')
  .setFieldName('date') //taskDate1.num
  .addItem(date, date, true);
  for(var b = 1; b < 10; b++){
    var dateChange = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * b);
    var date1 = Utilities.formatDate(dateChange, "JST", "MMMMM d',' yyyy ");
    dropdownGroup.addItem(date1, date1, false);
  }
  section.addWidget(dropdownGroup);
  var hour = Utilities.formatDate(new Date(), "JST", "HH");
  var dropdownGroup2 = CardService.newSelectionInput()
  .setType(CardService.SelectionInputType.DROPDOWN)
  .setTitle("時")
  .setFieldName('hour') //taskDate1.num
  .addItem(hour, hour, true);
  
  for(var c = 1; c < 24; c++){//(24 - hour)
    var hour = Utilities.formatDate(new Date(), "JST", "HH");
    var hourChange = new Date(new Date().getTime() + 1000 * 60 * 60 * c);
    var hour1 = Utilities.formatDate(hourChange, "JST", "HH");
    dropdownGroup2.addItem(hour1, hour1, false);
  }                     
  section.addWidget(dropdownGroup2); 
  
  var min = Utilities.formatDate(new Date(), "JST", "mm");
  var test = Math.ceil(min/10)*10;;
  var dropdownGroup3 = CardService.newSelectionInput()
  .setType(CardService.SelectionInputType.DROPDOWN)
  .setTitle("分")
  .setFieldName('min') //taskDate1.num
  .addItem(test, test, true);
     
  for(var d = 1; d <6; d++){ //(60 - min)
    var minChange = new Date(new Date().getTime() + 1000 * 60 * 10 * d);
    var time_min = Utilities.formatDate(minChange, "JST", "mm");
    var min1 = Math.ceil(time_min/10)*10;
    dropdownGroup3.addItem(min1, min1, false);
  }
  
  section.addWidget(dropdownGroup3);
  
  var textButton = CardService.newTextButton()
  .setText("OK")
  .setOnClickAction(CardService.newAction()
                    .setFunctionName("handleCheckboxChange"));
  section.addWidget(CardService.newButtonSet().addButton(textButton));
  
  var textButton = CardService.newTextButton()
  .setText("Open Calendar Link")
  .setOpenLink(CardService.newOpenLink()
               .setUrl("https://calendar.google.com/calendar/r"));
  section.addWidget(CardService.newButtonSet().addButton(textButton));
  
  card.addSection(section);
  return card.build();
}

function checkChange(e){
  var test = e.formInputs.test;
  var userProperties = PropertiesService.getScriptProperties();
  for(var a = 0;a < test.length;a++){
    var check = e.formInputs.test[a];
    var repeat= false;
    for(var b = 1;b < 4;b++){
      var checkname = 'list_' + b;
      var checkunits = userProperties.getProperty(checkname);
      if(check == checkunits){
        repeat= true;
        break;
      }
    }
    if(!repeat){
      for(var i = 1;i < 4;i++){
        var name = 'list_' + i;
        var units = userProperties.getProperty(name);
        if(units == 'null'){
          units = check; // Only changes local value, not stored value.
          userProperties.setProperty(name, units); // Updates stored value.
          var userProperties1 = PropertiesService.getScriptProperties();
          var data = userProperties1.getProperties();
          var units1 = userProperties1.getProperty(name);
          break;
        }
      }
    }
  }
}

function handleCheckboxChange(e){
  var num = 1;
  var selected_CHECK = !!e.formInput.test;
  var createdate = e.formInputs.test;
  var addDate = e.formInputs.date;
  var addHour = e.formInputs.hour;
  var addMin = e.formInputs.min;  
  var endHour;
  var now = new Date();
  var threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  var event_had = CalendarApp.getDefaultCalendar().getEvents(now, threeHoursFromNow);
  if(addMin <= 50){
    if(event_had){
      var time_min = Math.ceil(addMin/10)*10;
      addHour = parseInt(addHour) + event_had.length;
      endHour = parseInt(addHour) + 1;
    } else {
      var time_min = Math.ceil(addMin/10)*10;
      addHour = parseInt(addHour) ;
      endHour = parseInt(addHour) + 1;
    }
  } else {
    if(event_had){
      addHour = parseInt(addHour) + event_had.length ;
      endHour = parseInt(addHour) + 1;
      time_min ="00";
    } else {
      addHour = parseInt(addHour);
      endHour = parseInt(addHour) + 1;
      time_min ="00";
    }
  }
  var startDate = addDate + addHour+":"+time_min+":00";
  var endDate = addDate + endHour+":"+time_min+":00";
  if(selected_CHECK) {
    for(a = 0; a < createdate.length;a++){
      var name = 'list_' + (a+1);
      var userProperties1 = PropertiesService.getScriptProperties();
      var eventName = userProperties1.getProperty(name);
      if(eventName !== 'null'){
        var startDate = addDate + parseInt(addHour+a)+":"+time_min+":00";
        var endDate = addDate + parseInt(endHour+a)+":"+time_min+":00";   
        var event = CalendarApp.getDefaultCalendar().createEvent(eventName,
                                                                 new Date(startDate),
                                                                 new Date(endDate));}
    }
    var del = PropertiesService.getScriptProperties();
    del.deleteAllProperties();
    return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
                     .setType(CardService.NotificationType.INFO)
                     .setText("イベント追加成功"))
    .build();
  } 
}
