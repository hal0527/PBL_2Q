function buildAddOn(e) {
  var project_list = ProjectListData();
  var cards = []; 
  if (project_list.length > 0) {
    project_list.forEach(function(project_data) {
      cards.push(BuildCard(project_data));
    });
  } else {
    cards.push(CardService.newCardBuilder()
                          .setHeader(CardService.newCardHeader()
                                                .setTitle('No sheet data.')).build());
  }
  return cards;
} 
//データ保存、必要がないかも
function ProjectListData(){
  var project_lists = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', 'sheet2!b2:c20');
  var recents = [];
  for(var i=0;i < project_lists.values.length; i++){
    recents.push({
      'id': i+2,
      'project_name': project_lists.values[i][0],
      'sales': project_lists.values[i][1]
    });
  }
   return recents;
}

function ProjectData(project_data_id){
  var start_step = 'd'+ project_data_id;
  var end_step = 'h'+ project_data_id;
  var range = 'sheet2!'+ start_step + ':' + end_step;
  var project_data = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', range).values;
  return project_data;
}

//メールを発送機能が完成、しかしコードの整合が未完成
function BuildCard(project_data){
  var project_status = ProjectData(project_data.id);
  var card = CardService.newCardBuilder();
  var section = CardService.newCardSection();
  var step_data = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', 'sheet2!d1:h1').values;
  var row_number = (project_data.id).toString();
  var checkboxGroup = CardService.newSelectionInput()
                                   .setType(CardService.SelectionInputType.CHECK_BOX)
                                   .setFieldName('check_box')
                                   .setOnChangeAction(CardService.newAction()
                                                                 .setFunctionName("StatusChange")
                                                                 .setParameters({row_number:row_number}));; 
  for (var i = 0; i < step_data[0].length; i++) {
    var name = step_data[0][i];
    if(project_status == undefined){
      checkboxGroup.addItem(name, name, false);
    } else if(project_status[0][i] == 'Done'){
      checkboxGroup.addItem(name, name, true);
    } else {
      checkboxGroup.addItem(name, name, false);
    }
  }
  
  var text1 = step_data[0][0] +'のテンプレートを呼び出す';
  var send_email1 = CardService.newTextButton()
                              .setText(text1)
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("SendEmail1"));  
  var text2 = step_data[0][1] +'のテンプレートを呼び出す';
  var send_email2 = CardService.newTextButton()
                              .setText(text2)
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("SendEmail2"));  
  var text3 = step_data[0][2] +'のテンプレートを呼び出す';
  var send_email3 = CardService.newTextButton()
                              .setText(text3)
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("SendEmail3"));  
  var text4 = step_data[0][3] +'のテンプレートを呼び出す';
  var send_email4 = CardService.newTextButton()
                              .setText(text4)
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("SendEmail4"));
  var text5 = step_data[0][4] +'のテンプレートを呼び出す';
  var send_email5 = CardService.newTextButton()
                              .setText(text5)
                              .setOnClickAction(CardService.newAction()
                                                           .setFunctionName("SendEmail5"));                                                            
  var button = CardService.newTextButton()
    .setText("SPREADSHEETを開く")
    .setOpenLink(CardService.newOpenLink()
        .setUrl("https://docs.google.com/spreadsheets/d/1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ")
        .setOpenAs(CardService.OpenAs.OVERLAY)
        .setOnClose(CardService.OnClose.RELOAD_ADD_ON));
  section.addWidget(checkboxGroup);
  section.addWidget(send_email1);
  section.addWidget(send_email2);
  section.addWidget(send_email3);
  section.addWidget(send_email4);
  section.addWidget(send_email5);
  section.addWidget(button);
  card.addSection(section);
  card.setHeader(CardService.newCardHeader().setTitle(project_data.project_name));
  return card.build();
}

//checkbox 確認、sheet入力完成　しかしcheckoff機能なし
function StatusChange(e){
  var checked_group = e.formInputs.check_box;
  var row_number = e.parameters.row_number;
  var line_number;

  for(var i = 0; i < checked_group.length; i++){
    var step_name = checked_group[i];
    switch (step_name)
    {  case "導入説明":
            line_number = "d";
            break;
        case "アカウント発行依頼":
            line_number = "e";
            break;
        case "サイト解析依頼":
            line_number = "f";
            break;
        case "実装確認依頼":
            line_number = "g";
            break;
        case "予算設定依頼":
            line_number = "h";
            break; 
    }
    var range = 'sheet2!' + line_number + row_number;
    var values = [
      [
        'Done'
      ]
    ];
    var valueRange = Sheets.newValueRange();
    valueRange.values = values;
    var result = Sheets.Spreadsheets.Values.update(valueRange, '1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', range, {
    valueInputOption: 'RAW'}); 
  }
}

function SendEmail1(){
  var send_data = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', 'sheet1!b4:d4').values;
  var mail = send_data[0][0];
  var subject = send_data[0][1];
  var main_body = send_data[0][2];
  MailApp.sendEmail(mail, subject, main_body)
  //var html = HtmlService.createHtmlOutputFromFile("message").getContent();
}
function SendEmail2(){
  var send_data = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', 'sheet1!b5:d5').values;
  var mail = send_data[0][0];
  var subject = send_data[0][1];
  var main_body = send_data[0][2];
  MailApp.sendEmail(mail, subject, main_body)
  //var html = HtmlService.createHtmlOutputFromFile("message").getContent();
}
function SendEmail3(){
  var send_data = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', 'sheet1!b6:d6').values;
  var mail = send_data[0][0];
  var subject = send_data[0][1];
  var main_body = send_data[0][2];
  MailApp.sendEmail(mail, subject, main_body)
  //var html = HtmlService.createHtmlOutputFromFile("message").getContent();
}
function SendEmail4(){
  var send_data = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', 'sheet1!b7:d7').values;
  var mail = send_data[0][0];
  var subject = send_data[0][1];
  var main_body = send_data[0][2];
  MailApp.sendEmail(mail, subject, main_body)
  //var html = HtmlService.createHtmlOutputFromFile("message").getContent();
}
function SendEmail5(){
  var send_data = Sheets.Spreadsheets.Values.get('1M05QfoasPgJpBC4CL58SVp6zx-MrhqsSSMyV735otvQ', 'sheet1!b8:d8').values;
  var mail = send_data[0][0];
  var subject = send_data[0][1];
  var main_body = send_data[0][2];
  MailApp.sendEmail(mail, subject, main_body)
  //var html = HtmlService.createHtmlOutputFromFile("message").getContent();
}
