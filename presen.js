var animation;
var pager;
var isIPhone = WebKitDetect.isMobile();

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
PresenAnimater.prototype.setActions =
function(pageIdx, actions, backActions){
   this.actionStack[pageIdx] = actions;
   this.backActionStack[pageIdx] = backActions;
}
PresenAnimater.prototype.doNextAction = function(){
   if (this.pointer == this.currentPageAction.length) {
      pager.gotoNextPage();
      this.pointer = 0;
   } else {
      this.currentPageAction[this.pointer]();
      this.pointer += 1;
   }
}
PresenAnimater.prototype.stepBackPrevAction = function(){
   if (this.pointer == 0) {
      if(pager.currentPage != 0) {
         pager.gotoPrevPage();
         this.pointer = this.currentPageBackAction.length;
      }
   } else {
      this.pointer -= 1;
      this.currentPageBackAction[this.pointer]();
   }
}
// set actions for current page
PresenAnimater.prototype.prepareAction = function(pageIdx){
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
      animation.prepareAction(this.currentPage);
      this.adjustThumbsPage();
   }
};
PresenPager.prototype.gotoPrevPage = function(){
   if (this.currentPage > 0) {
      this.currentPage--;
      animation.prepareAction(this.currentPage);
      this.adjustThumbsPage();
   }
};
PresenPager.prototype.setPage = function(idx){
   this.currentPage = idx;
   animation.prepareAction(this.currentPage);
   this.adjustThumbsPage();
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
            if (!isIPhone) {
               x = pageWidth * (i-pager.currentPage);
               y = 0;
            } else {
               x = pageWidth * (i-pager.currentPage);
               y = Config.pageHeight/10;
            }
            widthRatio  = window.innerWidth / pageWidth;
            heightRatio = window.innerHeight / pageHeight;
            scale = Math.min(widthRatio, heightRatio) * 0.9;

            break;
         case thumbsMode:
            defaultX = pagedata[i].thumbPosX;
            defaultY = pagedata[i].thumbPosY;
            if (!isIPhone){
               x = defaultX +
                  (Math.floor(i/Config.numOfPagesInThumbsPage) -
                   pager.currentThumbsPage) *
                  (thumbsPageWidth + interval);
               y = defaultY;
            } else {
               x = defaultX +
                  (Math.floor(i/Config.numOfPagesInThumbsPage) -
                   pager.currentThumbsPage) *
                  (thumbsPageWidth + interval);
               y = defaultY+Config.pageHeight/10*Config.numOfThumbsInRow;
            }
            widthRatio  = window.innerWidth / pageWidth;
            heightRatio = window.innerHeight / pageHeight;
            scale = Math.min(widthRatio, heightRatio) * 0.9 /
                       Config.numOfThumbsInRow;

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
      pages[i].onclick = (function(i){
         return function(e){
            pager.setPage(i);
            animation.prepareAction(pager.currentPage);
            currentMode = viewMode;
            translatePage();
         }
      })(i);

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


   if (isIPhone) {
      document.body.style.width  = Config.pageWidth+100;
      document.body.style.height = Config.pageHeight+100;
      setTimeout(function(){window.scrollTo(0,1);}, 200);
   }


   function pushLeft(){
      if (currentMode == viewMode) {
         animation.stepBackPrevAction();
      } else if (currentMode == thumbsMode) {
         pager.prevThumbsPage();
      }
      translatePage();
   }
   function pushRight(){
      if (currentMode == viewMode) {
         animation.doNextAction();
      } else if (currentMode == thumbsMode) {
         pager.nextThumbsPage();
      }
      translatePage();
   }
   function pushUp(){
      currentMode = thumbsMode;
      translatePage();
   }
   function pushDown(){
      animation.prepareAction(this.currentPage);
      pager.setPage(pager.currentPage);
      currentMode = viewMode;
      translatePage();
   }

   if (!isIPhone) {
      document.body.addEventListener("keyup", function(e){
         switch(e.keyCode) {
         case keymap.left:
            pushLeft();
            break;
         case keymap.right:
            pushRight();
            break;
         case keymap.up:
            pushUp();
            break;
         case keymap.down:
            pushDown();
            break;
         }
      }, false);
   } else {
      var oX = 0;
      var oY = 0;
      var touching = false;
      var scrollX = 0;
      var scrollY = 0;
      var target;
      function touchHandler(e) {
         if (e.type == "touchstart") {
            e.preventDefault();
            touching = true;
            if (e.touches.length == 1) {
               var touch = e.touches[0];
               target = touch.target;

               oX = touch.pageX;
               oY = touch.pageY;
               nX = 0;
               nY = 0;
               scrollX = 0;
               scrollY = 0;
            }
         }
         else if (e.type == "touchmove") {
            if (e.touches.length == 1) {
               e.preventDefault();
               var touch = e.touches[0];
               var nX = touch.pageX;
               var nY = touch.pageY;
               
               if (oX > nX) {
                  var scrollX = oX-nX;
                  if (scrollX > 100) {
                     if (touching == true) {
                        touching = false;
                        pushRight();
                     }
                  }
               } else {
                  var scrollX = nX-oX;
                  if (scrollX > 100) {
                     if (touching == true) {
                        touching = false;
                        pushLeft();
                     }
                  }
               }
               if (oY > nY) {
                  var scrollY = oY-nY;
                  if (scrollY > 100) {
                     if (touching == true) {
                        touching = false;
                        pushUp();
                     }
                  }
               } else {
                  var scrollY = nY-oY;
                  if (scrollY > 100) {
                     if (touching == true) {
                        touching = false;
                        pushDown();
                     }
                  }
               }
            }
         } else if (e.type == "touchend") {
            if(touching){
               if(target.onclick){
                  target.onclick();
               }
            }
            touching = false;
         } else if (e.type == "touchcancel") {
            touching = false;
         }
      }

      document.body.addEventListener('touchstart', touchHandler, false);
      document.body.addEventListener('touchmove', touchHandler, false);
      document.body.addEventListener('touchend', touchHandler, false);
      document.body.addEventListener('touchcancel', touchHandler, false);
   }

   translatePage();
}
