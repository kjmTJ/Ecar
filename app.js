const express = require('express');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
var request = require('request');

const axios = require("axios");
const cheerio = require("cheerio");
const XLSX = require("xlsx");


var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', './');

app.get('/index', (req, response) => {
  let array = new Array();
  let List = new Array();
  // var getHtml = async () => {
  //   try {
  //     return await axios.get("https://ev.or.kr/portal/buyersGuide/incenTive?pMENUMST_ID=21549");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  function getHtml() {
    try {
      return axios.get("https://ev.or.kr/portal/buyersGuide/incenTive?pMENUMST_ID=21549");
    } catch (error) {
      console.error(error);
    }
  }
  
  getHtml()
    .then(html => {
      let ulList = [];
      const $ = cheerio.load(html.data); //html 문자열을 받아 cheerio 객체를 반환합니다.
      const $bodyList = $("table.table_02_2_1 tbody").eq(0).children("tr");
      // 태그.class 안에 ul태그  안에  li태그.class이름
      for (var row = 0; row < $bodyList.length; row++) {
        var cells = $bodyList.eq(row).children();
        array[row] = new Array(cells);
        for (var column = 0; column < cells.length; column++) {
          var hero = cells.eq(column).text();
          array[row][column] = hero;
        }
      }

      // var conngetHtml = async () => {
      //   try { return await axios.get("https://www.ev.or.kr/portal/chargerkind?pMENUMST_ID=21629"); }
      //   catch (error) { console.error(error); }
      // };
      function conngetHtml() {
        try {
          return axios.get("https://www.ev.or.kr/portal/chargerkind?pMENUMST_ID=21629");
        } catch (error) {
          console.error(error);
        }
      }
      conngetHtml()
        .then(html => {
          const $ = cheerio.load(html.data); //html 문자열을 받아 cheerio 객체를 반환합니다.
          const $mainbody = $("table").eq(2);
          const $bodyList = $mainbody.children("tbody").children("tr");
          // 태그.class 안에 ul태그  안에  li태그.class이름
          for (var row = 0; row < $bodyList.length; row++) {
            var cells = $bodyList.eq(row).children();
            array[32 + row] = new Array(cells);
            for (var column = 0; column < cells.length; column++) {
              var hero;
              if ((32+row == 33 || 32+row == 34)&&(column==1 ||column==2 || column==3 || column==4)) {
                hero = "https://www.ev.or.kr" + cells.eq(column).children().attr('src');
              }
              else { hero = cells.eq(column).text(); }
              array[32 + row][column] = hero;
            }
          }
          return array;
        }).then(res => response.render("index", { data: res })); // return된 data는 res가 된다
    });
  });
app.get("/excel", function(req,res){

  let workbook = XLSX.readFile("./201909car.xlsx");
  let worksheet = workbook.Sheets["10.연료별_등록현황"];
  let array = new Array();

  array.push(worksheet["U"+21].v);//휘발유
  
  array.push(worksheet["U"+38].v);//경우
  
  array.push(worksheet["U"+55].v);//LPG
  
  array.push(worksheet["U"+89].v);//전기
  res.send(array)
  // https://victorydntmd.tistory.com/40
});

app.get("*", (req, res) => { res.json("Page not found"); });

if (!module.parent) {
  app.listen(8085);
  console.log('started on port 8080');
}
  // http://happinessoncode.com/2018/05/20/nodejs-exports-and-module-exports/