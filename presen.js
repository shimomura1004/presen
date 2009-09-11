var animation;
var pager;

/** ページごとのアニメーションを管理するクラス
 */
function PresenAnimater(){
   this.pointer = 0;
   this.actionStack = [];        // ページごとの動作リストのリスト
   this.backActionStack = [];    // ページごとの戻り動作リストのリスト
   this.currentPageAction = [];
   this.currentPageBackAction = [];
}
PresenAnimater.prototype.init = function(numOfPages){
   for (var i=0; i < numOfPages ; i++) {
      this.actionStack.push([]);
      this.backActionStack.push([]);
   }
};
PresenAnimater.prototype.addActions = function(actions,backActions){
   this.actionStack.push(actions);
   this.backActionStack.push(backActions);
}
PresenAnimater.prototype.doNextAction = function(){
   if (this.pointer == this.currentPageAction.length) {
      pager.gotoNextPage();
   } else {
      this.currentPageAction[this.pointer]();
      this.pointer += 1;
   }
}
PresenAnimater.prototype.stepBackPrevAction = function(){
   if (this.pointer == 0) {
      pager.gotoPrevPage();
   } else {
      this.pointer -= 1;
      this.currentPageBackAction[this.pointer]();
   }
}
// set actions for current page
PresenAnimater.prototype.setAction = function(pageIdx){
   this.currentPageAction     = this.actionStack[pageIdx];
   this.currentPageBackAction = this.backActionStack[pageIdx];
}

/** ページ遷移を管理するクラス
 */
function PresenPager(){ 
   this.adjustThumbsPage = function(){
      this.currentThumbsPage =
      Math.floor(this.currentPage / this.numOfThumbs);
   };

   this.lastPage;
   this.lastThumbsPage;
   this.numOfThumbs;
   this.currentPage = 0;
   this.currentThumbsPage = 0;
   return this;
};
PresenPager.prototype.init =
function(lastPage, lastThumbsPage, numOfThumbs){
   this.lastPage = lastPage;
   this.lastThumbsPage = lastThumbsPage;
   this.numOfThumbs = numOfThumbs;
   this.currentPage = 0;
   this.currentThumbsPage = 0;
};
PresenPager.prototype.gotoNextPage = function(){
   if (this.currentPage < this.lastPage-1) {
      this.currentPage++;
      this.adjustThumbsPage();
   }
};
PresenPager.prototype.gotoPrevPage = function(){
   if (this.currentPage > 0) {
      this.currentPage--;
      this.adjustThumbsPage();
   }
};
PresenPager.prototype.setPage = function(idx){
   this.currentPage = idx;
   this.adjustThumbsPage();
   animation.setAction(idx);
};
PresenPager.prototype.nextThumbsPage = function(){
   if (this.currentThumbsPage < this.lastThumbsPage) {
      this.currentThumbsPage++;
   }
};
PresenPager.prototype.prevThumbsPage = function(){
   if (this.currentThumbsPage > 0) {
      this.currentThumbsPage--;
   }
};

animation = new PresenAnimater();
pager     = new PresenPager();


function initializePresen
(pageWidth, pageHeight, numOfThumbsInRow, interval){
   const Config = {
         'pageWidth': pageWidth,
         'pageHeight': pageHeight,
         'numOfThumbsInRow': numOfThumbsInRow,
         'numOfPagesInThumbsPage': Math.pow(numOfThumbsInRow, 2),
         'intervalOfPages': 20
   }
   const keymap = {'left':37, 'up':38, 'right':39, 'down':40};
   var pagedata;

   const viewMode   = 0;
   const thumbsMode = 1;
   var currentMode = thumbsMode;

   function translatePage() {
      for (var i=0 ; i < pagedata.length ; i++) {
         const pageWidth = Config.pageWidth + Config.intervalOfPages;
         const thumbsPageWidth = pageWidth * (Config.numOfThumbsInRow);

         var x, y;
         var scale;
         switch (currentMode) {
         case viewMode:
            x = pageWidth * (i-pager.currentPage);
            y = 0;
            scale = 1;
            
            break;
         case thumbsMode:
            defaultX = pagedata[i].thumbPosX;
            defaultY = pagedata[i].thumbPosY;
            scale = 1/Config.numOfThumbsInRow;

            x = defaultX +
               (Math.floor(i/Config.numOfPagesInThumbsPage) -
                pager.currentThumbsPage) *
               (thumbsPageWidth + interval);
            y = defaultY;
            
            break;
         }

         pagedata[i].page.style.webkitTransform =
            "scale("+scale+") translate("+x+"px, "+y+"px)";
      }
   }

   pages = document.getElementsByClassName('page');
   pagedata = new Array(pages.length);
   animation.init(pages.length);
   pager.init(pagedata.length,
              Math.floor(pagedata.length /
                         Config.numOfPagesInThumbsPage),
              Config.numOfPagesInThumbsPage);


   for (var i=0 ; i < pages.length ; i++) {
      pages[i].style.zIndex = 1000-i;
      pages[i].style.top  = (window.innerHeight-Config.pageHeight)/2;
      pages[i].style.left = (window.innerWidth-Config.pageWidth)/2;
      pages[i].style.width = Config.pageWidth;
      pages[i].style.height = Config.pageHeight;
      pages[i].addEventListener('click', (function(i){
         return function(e){
            pager.setPage(i);
            currentMode = viewMode;
            translatePage();
         }
      })(i), false);
      

      var pagedatum = {
         page: pages[i],
         thumbPosX:
         Config.pageWidth/2 + 
            (Config.pageWidth + Config.intervalOfPages) *
            (i % Config.numOfThumbsInRow - Config.numOfThumbsInRow/2),
         thumbPosY:
         Config.pageHeight/2 +
            (Config.pageHeight + Config.intervalOfPages) *
            (Math.floor(i%Config.numOfPagesInThumbsPage /
                        Config.numOfThumbsInRow) -
             Config.numOfThumbsInRow/2),
      };
      pages[i].style.webkitTransform = 
         "scale(1) translate("+
         ((Config.pageWidth + Config.intervalOfPages) * i)+"px, 0px)";

      pagedata[i] = pagedatum;
   }



   translatePage();
   document.body.addEventListener("keyup", function(e){
      switch(e.keyCode) {
      case keymap.left:
         if (currentMode == viewMode) {
//            pager.gotoPrevPage();
            animation.stepBackPrevAction();
         } else if (currentMode == thumbsMode) {
            pager.prevThumbsPage();
         }
         translatePage();
         break;

      case keymap.right:
         if (currentMode == viewMode) {
//            pager.gotoNextPage();
            animation.doNextAction();
         } else if (currentMode == thumbsMode) {
            pager.nextThumbsPage();
         }
         translatePage();
         break;

      case keymap.up:
         currentMode = thumbsMode;
         translatePage();
         break;

      case keymap.down:
         currentMode = viewMode;
         translatePage();
         break;
      }
   }, false);
}
