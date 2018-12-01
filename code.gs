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
    for (var i = 0; i <= taskDate.length-1; i++) {
      var taskDate1 = taskDate[i];
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
  for(var i = 1; i <= 9; i++){
    var dateChange = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * i);
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
  
  for(var i = 1; i <= 23; i++){//(24 - hour)
    var hour = Utilities.formatDate(new Date(), "JST", "HH");
    var hourChange = new Date(new Date().getTime() + 1000 * 60 * 60 * i);
    var hour1 = Utilities.formatDate(hourChange, "JST", "HH");
    dropdownGroup2.addItem(hour1, hour1, false);
  }
  section.addWidget(dropdownGroup2);
  
  var min = Utilities.formatDate(new Date(), "JST", "mm");
  var test = Math.ceil(min/10)*10;
  var dropdownGroup3 = CardService.newSelectionInput()
  .setType(CardService.SelectionInputType.DROPDOWN)
  .setTitle("分")
  .setFieldName('min') //taskDate1.num
  for(var i = 0; i <=5; i++){ //(60 - min)
    var minChange = new Date(new Date().getTime() + 1000 * 60 * 10 * i);
    var time_min = Utilities.formatDate(minChange, "JST", "mm");
    var min1 = Math.ceil(time_min/10)*10;
    if(min1==60)var min1=00;
    var min1 = min1.toFixed();
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
    for(i = 0; i < createdate.length;i++){
      var eventName = createdate[i];
      if(eventName !== 'null'){
        var startDate = addDate + parseInt(addHour+i)+":"+time_min+":00";
        var endDate = addDate + parseInt(endHour+i)+":"+time_min+":00";
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

function getMaildata(e) {
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  var section = CardService.newCardSection();
  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);
  var textbody = message.getPlainBody();
  var title = message.getSubject();
  GmailApp.ge
  var url = message.getThread().getPermalink();
  var date,time;
  textbody.replace(/((\d{4}年(\d{1,2}月)\d{1,2}日))/g, function ($0) {
    if ($0 && $0 != date) {
       date = $0;
       date = date.replace(/年/g, '/');
       date = date.replace(/月/g, '/');
       date = date.replace(/日/g, '');
       Logger.log('111');
     } else {
       date = '2018/12/12';
       Logger.log('222');
     }
  })
  if(date == undefined){
    date = '2018/12/12';//now
  }
  Logger.log(test);
  textbody.replace(/(\d{1,2}(:\d{1,2}))/g, function ($0) {
    if ($0 && $0 != time) {
       time = $0;
     }
  })
  textbody.replace(); 
  //カードの設定                            
  var eventName = CardService.newTextInput()
                             .setFieldName("eventName_input")
                             .setTitle("イベント名前")
                             .setValue(title);
  var memo = CardService.newTextInput()
                        .setFieldName("memo_input")
                        .setTitle("メモ");
  var email_link = CardService.newTextInput()
                              .setFieldName("email_link")
                              .setTitle("リンク")
                              .setValue(url);                         
  var event_date = date.toString();
  var event_dateGroup = CardService.newTextInput()
                                   .setFieldName("date")
                                   .setTitle("日付け")
                                   .setValue(event_date);                                                        
  var timeGroup = CardService.newSelectionInput()
                             .setType(CardService.SelectionInputType.DROPDOWN)
                             .setTitle("時間")
                             .setFieldName('time') //taskDate1.num
  
  for(var i = 0; i < 24; i++){//(24 - hour)
      var timeChange = time.substr(0, 2);
      var time1 = i;
      if(time1 == timeChange){
        timeGroup.addItem(time1, time1, true);
      } else {
        timeGroup.addItem(time1, time1, false);
      }
  }                                                             
  
  var calNum = CalendarApp.getAllCalendars();
  var calname0 = CalendarApp.getDefaultCalendar().getName();
  var calGroup = CardService.newSelectionInput()
                              .setType(CardService.SelectionInputType.DROPDOWN)
                              .setTitle("カレンダー")
                              .setFieldName('calendar_name') //taskDate1.num
                              .addItem(calname0, calname0, true);
  for(var j = 0; j < calNum.length; j++){
      var event = CalendarApp.getAllCalendars();
      var calname = calNum[j].getName();
      var claid = calNum[j].getId();
      if(calname !== calname0){
        calGroup.addItem(calname, claid, false);
      }
  }                     
  
  var event_timeGroup = CardService.newSelectionInput()
                              .setType(CardService.SelectionInputType.DROPDOWN)
                              .setTitle("イベント時長")
                              .setFieldName('event_time') //taskDate1.num
  
  for(var l = 1; l < 25; l++){//(24 - hour)
      var event_time = l;
      event_timeGroup.addItem(event_time, event_time, false);
  }          
  
  var textParagraph = CardService.newTextParagraph()
                                 .setText(textbody);
  
  var textButton = CardService.newTextButton()
                              .setText("追加する")
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("addEvent"));
                                                         
  section.addWidget(eventName); 
  section.addWidget(memo);
  section.addWidget(calGroup);
  section.addWidget(event_dateGroup);
  section.addWidget(timeGroup);  
  section.addWidget(event_timeGroup);
  section.addWidget(textButton);
  section.addWidget(email_link);
  
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
                          .setTitle('<font color="#ea9999">イベント追加</font>'))
    .addSection(section)
    .build();
  return CardService.newUniversalActionResponseBuilder()
      .displayAddOnCards([card])
      .build();
}

function addEvent(e){
  var addEvent_Name = e.formInputs.eventName_input;
  var addEvent_Memo = e.formInputs.memo_input;
  var addEvent_Date = e.formInputs.date;
  var addEvent_Time = e.formInputs.time;
  var addEvent_long = e.formInputs.event_time;
  var Calendar_Id = e.formInputs.calendar_name;
  var email_url = e.formInputs.email_link;
  var endHour;  
  email_url = email_url.toString();
  if(addEvent_Name !== 'null'){
     var startTime = addEvent_Date + " " + addEvent_Time;
     var time = addEvent_Time.toString();
     time = time.substr(0,2);
     time = Number(time) + Number(addEvent_long);
     var endTime = addEvent_Date + " "+ time + ":00";   
     var memo = addEvent_Memo + email_url;
     var event = CalendarApp.getCalendarById(Calendar_Id).createEvent(addEvent_Name,
                                                                      new Date(startTime),
                                                                      new Date(endTime),
                                                                      {location: 'The Moon',
                                                                       description: memo});
  } 
    
  return CardService.newActionResponseBuilder()
                    .setNotification(CardService.newNotification()
                    .setType(CardService.NotificationType.INFO)
                    .setText("イベント追加成功"))
                    .build();
} 