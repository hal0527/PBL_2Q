function cal2todo_AddOn(e) {
  var taskList = taskListData();
  var cards = [];
  
  if (taskList.length > 0) {
    taskList.forEach(function(listDate) {
       cards.push(buildCard_task(listDate));
    });
  } else {
    cards.push(CardService.newCardBuilder()
         .setHeader(CardService.newCardHeader()
         .setTitle('No Tasklist from Google Tasks')).build());
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
          'etag': taskList.getEtag(),
          'updated': taskList.getUpdated()
      });
  });
  return recents;
}

function taskData(listDateID){
  var tasks = Tasks.Tasks.list(listDateID).getItems();
  var recents = [];
  tasks.forEach(function(task) {
      recents.push({
          'id': task.getId(),
          'name': task.getTitle(),
          'status': task.getStatus(),
          'checked': false
      });
  });
  return recents;
}
 
function buildCard_task(listDate){
  var taskDate = taskData(listDate.id);
  var card = CardService.newCardBuilder();
  var updateDate = listDate.updated;
  var updateTime = updateDate.substr(11 , 5);
  updateDate = updateDate.substr(0 , 10);
  card.setHeader(CardService.newCardHeader().setTitle(listDate.name)
                                            .setSubtitle('更新時間：' + updateDate + ' ' + updateTime)
                                            .setImageStyle(CardService.ImageStyle.SQUARE)
                                            .setImageUrl("http://icons.iconarchive.com/icons/icons8/ios7/128/User-Interface-Checklist-icon.png"));
  var section = CardService.newCardSection();
  
  if (taskDate) {
  var checkboxGroup = CardService.newSelectionInput()
                                 .setType(CardService.SelectionInputType.CHECK_BOX)
                                 .setFieldName('check_box');
     for (var a = 0; a <= taskDate.length-1; a++) {
        var taskDate1 = taskDate[a];
        if(taskDate1.status == 'needsAction'){
           checkboxGroup.addItem(taskDate1.name, taskDate1.name, false);
         } 
      }
      section.addWidget(checkboxGroup);
   }
  var date = Utilities.formatDate(new Date(), "JST", "MMMMM d',' yyyy ");
  var dropdownGroup = CardService.newSelectionInput()
                                 .setType(CardService.SelectionInputType.DROPDOWN)
                                 .setTitle('日付け')
                                 .setFieldName('date') //taskDate1.num
                                 .addItem(date, date, true);
  for(var b = 1; b <= 9; b++){
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
  
     for(var c = 1; c <= 23; c++){//(24 - hour)
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
   for(var d = 0; d <=5; d++){ //(60 - min)
     var minChange = new Date(new Date().getTime() + 1000 * 60 * 10 * d);
     var time_min = Utilities.formatDate(minChange, "JST", "mm");
     var minDouble = Math.ceil(time_min/10)*10;
     var min1 = minDouble.toFixed();
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

function handleCheckboxChange(e){
  var selected_CHECK = !!e.formInput.check_box;
  var createdate = e.formInputs.check_box;
  var addDate = e.formInputs.date;
  var addHour = e.formInputs.hour;
  var addMin = e.formInputs.min;
  var endHour;
  var now = new Date();
  var fiveHoursFromNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  var event_had = CalendarApp.getDefaultCalendar().getEvents(now, fiveHoursFromNow);
  
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
  
  // you can set and access paramters in the onchange action for further use.
  if(selected_CHECK) {
    for(a = 0; a < createdate.length;a++){
      var eventName = createdate[a];
      if(eventName !== 'null'){
        var startDate = addDate + parseInt(addHour+a)+":"+time_min+":00";
        var endDate = addDate + parseInt(endHour+a)+":"+time_min+":00";   
        var event = CalendarApp.getDefaultCalendar().createEvent(eventName,
                                                                  new Date(startDate),
                                                                  new Date(endDate));
       }
    }
    return CardService.newActionResponseBuilder()
                      .setNotification(CardService.newNotification()
                      .setType(CardService.NotificationType.INFO)
                      .setText("Added to Calendar!"))
                      .build();
  } 
}
   