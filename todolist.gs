function Cal2TodoAddOn(e) {
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  var taskList = TaskListData();
  var cards = []; 
  cards.push(CardService.newCardBuilder()
                          .setHeader(CardService.newCardHeader()
                                                .setTitle('Todoリストを選択してください。')).build());
  if (taskList.length > 0) {
    taskList.forEach(function(listData) {
      cards.push(BuildCardTask(listData));
    });
  } else {
    cards.push(CardService.newCardBuilder()
                          .setHeader(CardService.newCardHeader()
                                                .setTitle('No Tasklist from Google Tasks')).build());
  }
  return cards;
}

function TaskListData() {
  var taskLists = Tasks.Tasklists.list().getItems();
  var recents = [];
  taskLists.forEach(function(taskList) {
    recents.push({
      'id': taskList.getId(),
      'name': taskList.getTitle(),
      'updated': taskList.getUpdated()
    });
  });
  return recents;
}

function TaskData(listDataID){
  var tasks = Tasks.Tasks.list(listDataID).getItems();
  var recents = [];
  if(tasks == undefined){
     recents.push({
        'name': 'none'
      });
  } else { 
    tasks.forEach(function(task) {
      recents.push({
        'id': task.getId(),
        'name': task.getTitle(),
        'status': task.getStatus()
      });
    });
  }
  return recents;
}

function BuildCardTask(listData){
  var taskData = TaskData(listData.id);
  var card = CardService.newCardBuilder();
  var updateDate = listData.updated;
  var updateTime = updateDate.substr(11 , 5);
  updateDate = updateDate.substr(0 , 10);
  card.setHeader(CardService.newCardHeader().setTitle(listData.name)
                                            .setSubtitle('更新時間：' + updateDate + ' ' + updateTime)
                                            .setImageStyle(CardService.ImageStyle.SQUARE)
                                            .setImageUrl("http://icons.iconarchive.com/icons/icons8/ios7/128/User-Interface-Checklist-icon.png"));
  var section = CardService.newCardSection();
  var section2 = CardService.newCardSection();
  if(taskData[0].name == 'none'){
    var textParagraph = CardService.newKeyValue()
                                   .setContent("リストの中にはタスクがありません。"); 
    section.addWidget(textParagraph);                                                   
    card.addSection(section);
    return card.build();
  }
  var textParagraph = CardService.newKeyValue()
                                 .setIcon(CardService.Icon.OFFER)
                                 .setContent("カレンダーに追加したい項目を<br>チェックしてください。"); 
  section.addWidget(textParagraph);
  
  if (taskData !== undefined) {
    var checkboxGroup = CardService.newSelectionInput()
                                   .setType(CardService.SelectionInputType.CHECK_BOX)
                                   .setFieldName('check_box');
    for (var i = 0; i <= taskData.length-1; i++) {
      var taskData1 = taskData[i];
      if(taskData1.status == 'needsAction'){
        checkboxGroup.addItem(taskData1.name, taskData1.name, false);
      }
    }
    section.addWidget(checkboxGroup);
  }
  var date = Utilities.formatDate(new Date(), "JST", "MMMMM d',' yyyy ");
  var dropdownGroup = CardService.newSelectionInput()
                                 .setType(CardService.SelectionInputType.DROPDOWN)
                                 .setTitle('イベント日付け')
                                 .setFieldName('date') //
                                 .addItem(date, date, true);
  for(var i = 1; i <= 9; i++){
    var dateChange = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * i);
    var date1 = Utilities.formatDate(dateChange, "JST", "MMMMM d',' yyyy ");
    dropdownGroup.addItem(date1, date1, false);
  }  
  var hour = Utilities.formatDate(new Date(), "JST", "HH");
  var dropdownGroup2 = CardService.newSelectionInput()
                                  .setType(CardService.SelectionInputType.DROPDOWN)
                                  .setTitle("開始時間(Hour)")
                                  .setFieldName('hour') //taskDate1.num
                                  .addItem(hour, hour, true);  
  for(var i = 1; i <= 23; i++){//(24 - hour)
    var hour = Utilities.formatDate(new Date(), "JST", "HH");
    var hourChange = new Date(new Date().getTime() + 1000 * 60 * 60 * i);
    var hour1 = Utilities.formatDate(hourChange, "JST", "HH");
    dropdownGroup2.addItem(hour1, hour1, false);
  }
  
  var min = Utilities.formatDate(new Date(), "JST", "mm");
  var test = Math.ceil(min/10)*10;
  var dropdownGroup3 = CardService.newSelectionInput()
                                  .setType(CardService.SelectionInputType.DROPDOWN)
                                  .setTitle("開始時間(Minute)")
                                  .setFieldName('min');//taskDate1.num
  for(var i = 0; i <=5; i++){ //(60 - min)
    var minChange = new Date(new Date().getTime() + 1000 * 60 * 10 * i);
    var time_min = Utilities.formatDate(minChange, "JST", "mm");
    var min1 = Math.ceil(time_min/10)*10;
    if(min1==60)var min1=00;
    var min1 = min1.toFixed();
    dropdownGroup3.addItem(min1, min1, false);
  }
  var textButton1 = CardService.newTextButton()
                              .setText("カレンダー追加を実行する")
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("AddEventTask"));
  var textButton2 = CardService.newKeyValue()
                               .setIcon(CardService.Icon.STAR)
                               .setContent("Googleカレンダーを開く")
                               .setOpenLink(CardService.newOpenLink()
                                                       .setUrl("https://calendar.google.com/calendar/r")
                                                       .setOpenAs(CardService.OpenAs.OVERLAY)
                                                       .setOnClose(CardService.OnClose.RELOAD_ADD_ON));                                                           

  var calNum = CalendarApp.getAllCalendars();
  var calname0 = CalendarApp.getDefaultCalendar().getName();
  var calGroup = CardService.newSelectionInput()
                              .setType(CardService.SelectionInputType.DROPDOWN)
                              .setTitle("カレンダーの類別")
                              .setFieldName('calendar_name') //taskDate1.num
                              .addItem(calname0, calname0, true);
  for(var i = 0; i < calNum.length; i++){
      var event = CalendarApp.getAllCalendars();
      var calname = calNum[i].getName();
      var claid = calNum[i].getId();
      if(calname !== calname0){
        calGroup.addItem(calname, claid, false);
      }
  }     
  section.setHeader('<font color="#0080ff"><b>タスクのリスト</b></font>');
  section2.setHeader('<font color="#24998d"><b>イベントの設定</b></font>');
  section2.addWidget(dropdownGroup);
  section2.addWidget(dropdownGroup2);
  section2.addWidget(dropdownGroup3);
  section2.addWidget(calGroup);
  section2.addWidget(textButton1);  
  section2.addWidget(textButton2);                                                    
  
  card.addSection(section);
  card.addSection(section2);
  return card.build();
}

function AddEventTask(e){
  var selected_check = !!e.formInput.check_box;
  var create_data = e.formInputs.check_box;
  var add_date = e.formInputs.date;
  var add_hour = e.formInputs.hour;
  var add_min = e.formInputs.min;
  var end_hour;
  var now = new Date();
  var date_check = Utilities.formatDate(new Date(), "JST", "MMMMM d',' yyyy ");
  var fiveHoursFromNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
  if ( add_date == date_check){
    var event_had = CalendarApp.getDefaultCalendar().getEvents(now, fiveHoursFromNow);
  } else {
    var event_had = 0;
  }
  var calendar_id = e.formInputs.calendar_name;
  
  if(add_min <= 50){
      var time_min = Math.ceil(add_min/10)*10;
      add_hour = parseInt(add_hour) ;
      end_hour = parseInt(add_hour) + 1;
  } else {
      add_hour = parseInt(add_hour);
      end_hour = parseInt(add_hour) + 1;
      time_min ="00";
  }
  var startDate = add_date + add_hour+":"+time_min;
  var endDate = add_date + end_hour+":"+time_min;
  if(selected_check) {
    for(i = 0; i < create_data.length;i++){
      var eventName = create_data[i];
      if(eventName !== 'null'){
        var startDate = add_date + parseInt(add_hour+i)+":"+time_min;
        var endDate = add_date + parseInt(end_hour+i)+":"+time_min;
        var event = CalendarApp.getCalendarById(calendar_id).createEvent(eventName,
                                                                         new Date(startDate),
                                                                         new Date(endDate));
      }
    }
    return CardService.newActionResponseBuilder()
                      .setNotification(CardService.newNotification()
                                                  .setType(CardService.NotificationType.INFO)
                                                  .setText("イベント追加成功!"))
                      .build();
  }
}