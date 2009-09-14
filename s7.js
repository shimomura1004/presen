/*
  ページ1つずつに transform を指定するのではなく、 body に指定できるようにする
*/
var s7;
var pager;
var isIPhone = WebKitDetect.isMobile();

/* アニメーションを保持するクラス */
function Zipper(elems){
   this.leftStack  = [];
   this.rightStack = elems.reverse();
}
Zipper.prototype.emptyLeft = function(){
   return this.leftStack.length == 0;
}
Zipper.prototype.emptyRight = function(){
   return this.rightStack.length == 0;
}
Zipper.prototype.get = function(){
   if (!this.emptyRight()){
      return this.rightStack[this.rightStack.length-1];
   } else {
      return undefined;
   }
}
Zipper.prototype.go = function(){
   if (!this.emptyRight()){
      this.leftStack.push(this.rightStack.pop());
   }
}
Zipper.prototype.back = function(){
   if (!this.emptyLeft()){
      this.rightStack.push(this.leftStack.pop());
   }
}


/* ページごとのアニメーションを管理するクラス */
function Animator(){
   this.actionStack = [];        // ページごとの動作リストのリスト
   this.parseEasyTransition = function(action){
      for(var i=0 ; i < action.length ; i++) {
         var act = action[i];
         if (typeof(act[0])=="string") {
            if(act[0].slice(0,6)=="xpath:"){
               var targets = document.evaluate(act[0].slice(6), document,
                                               null, 7, null);
               for (var j=0 ; j < targets.snapshotLength ; j++){
                  targets.snapshotItem(j).style[act[1]] = act[2];
               }
            } else {
               $(act[0]).css(act[1], act[2]);
            }
         } else {
            act[0].style[act[1]] = act[2];
         }
      }
   }
}
Animator.prototype.init = function(numOfPages){
   for (var i=0; i < numOfPages ; i++) {
      if (!this.actionStack[i]) {
         this.actionStack[i] = new Zipper([]);
      }
   }
}
Animator.prototype.setActions =
function(pageIdx, actions, backActions){
   var tmp = [];
   for (var i=0 ; i < actions.length ; i++) {
      tmp.push([actions[i], backActions[i]]);
   }
   this.actionStack[pageIdx] = new Zipper(tmp);
}
Animator.prototype.doNextAction = function(){
   var currentPageActions = this.actionStack[pager.currentPage];
   if (currentPageActions.emptyRight()){
      pager.gotoNextPage();
   } else {
      var theAction = (currentPageActions.get())[0];
      if (typeof(theAction) == "function") {
         theAction();
      } else {
         this.parseEasyTransition(theAction);
      }
      currentPageActions.go();
   }
}
Animator.prototype.stepBackPrevAction = function(){
   var currentPageActions = this.actionStack[pager.currentPage];
   if (currentPageActions.emptyLeft()) {
      pager.gotoPrevPage();
   } else {
      currentPageActions = this.actionStack[pager.currentPage];
      currentPageActions.back();
      var theAction = (currentPageActions.get())[1];
      if (typeof(theAction) == "function") {
         theAction();
      } else {
         this.parseEasyTransition(theAction);
      }
   }
}


/* ページ遷移を管理するクラス */
function Pager(){ 
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
Pager.prototype.init =
function(lastPage, lastThumbsPage, numOfThumbs){
   this.lastPage = lastPage;
   this.lastThumbsPage = lastThumbsPage;
   this.numOfThumbs = numOfThumbs;
   this.currentPage = 0;
   this.currentThumbsPage = 0;
};
Pager.prototype.gotoNextPage = function(){
   if (this.currentPage < this.lastPage-1) {
      this.currentPage++;
      this.adjustThumbsPage();
   }
};
Pager.prototype.gotoPrevPage = function(){
   if (this.currentPage > 0) {
      this.currentPage--;
      this.adjustThumbsPage();
   }
};
Pager.prototype.setPage = function(idx){
   this.currentPage = idx;
   this.adjustThumbsPage();
};
Pager.prototype.nextThumbsPage = function(){
   if (this.currentThumbsPage < this.lastThumbsPage) {
      this.currentThumbsPage++;
   }
};
Pager.prototype.prevThumbsPage = function(){
   if (this.currentThumbsPage > 0) {
      this.currentThumbsPage--;
   }
};

s7    = new Animator();
pager = new Pager();


function initializePresen
(pageWidth, pageHeight, numOfThumbsInRow, interval){
   interval = interval?interval:100;
   const Config = {
         'pageWidth': pageWidth,
         'pageHeight': pageHeight,
         'numOfThumbsInRow': numOfThumbsInRow,
         'numOfPagesInThumbsPage': Math.pow(numOfThumbsInRow, 2),
         'intervalOfPages': 20
   }
   const keymap = {'left':37, 'up':38, 'right':39, 'down':40};

   const viewMode   = 0;
   const thumbsMode = 1;

   widthRatio = window.innerWidth/(pageWidth+Config.intervalOfPages);
   heightRatio = isIPhone?
      (window.innerHeight+180)/(pageHeight+Config.intervalOfPages):
      window.innerHeight/(pageHeight+Config.intervalOfPages);
   const scale = Math.min(widthRatio, heightRatio) * 0.9;
   const thumbScale = scale / Config.numOfThumbsInRow;

   var pagedata;
   var currentMode = thumbsMode;

   function translatePage() {
      const pageWidth = Config.pageWidth + Config.intervalOfPages;
      const thumbsPageWidth = pageWidth * (Config.numOfThumbsInRow);

      if (currentMode == viewMode) {
         document.body.style.WebkitTransform = "scale("+scale+")";
         document.body.style.MozTransform    = "scale("+scale+")";
      } else {
         document.body.style.WebkitTransform = "scale("+thumbScale+")";
         document.body.style.MozTransform    = "scale("+thumbScale+")";
      }

      for (var i=0 ; i < pagedata.length ; i++) {
         var x, y;
         if (currentMode == viewMode) {
            x = pageWidth * (i-pager.currentPage);
            y = 0;
         } else {
            defaultX = pagedata[i].thumbPosX;
            defaultY = pagedata[i].thumbPosY;
            
            x = defaultX +
                  (Math.floor(i/Config.numOfPagesInThumbsPage) -
                   pager.currentThumbsPage) *
                  (thumbsPageWidth + interval);
            y = defaultY;
         }

         pagedata[i].page.style.WebkitTransform =
            "translate("+x+"px, "+y+"px)";
         pagedata[i].page.style.MozTransform = 
            "translate("+x+"px, "+y+"px)";
      }
   }

   pages = document.getElementsByClassName('page');
   pagedata = new Array(pages.length);
   s7.init(pages.length);
   pager.init(pagedata.length,
              Math.floor(pagedata.length /
                         Config.numOfPagesInThumbsPage),
              Config.numOfPagesInThumbsPage);

   for (var i=0 ; i < pages.length ; i++) {
      pages[i].style.zIndex = 1000-i;
      if(!isIPhone){
         pages[i].style.top  = (window.innerHeight-Config.pageHeight)/2;
      } else {
         pages[i].style.top  = (window.innerHeight-Config.pageHeight)/2+
            (Config.pageHeight/16);
      }
      pages[i].style.left = (window.innerWidth-Config.pageWidth)/2;
      pages[i].style.width = Config.pageWidth;
      pages[i].style.height = Config.pageHeight;
      pages[i].onclick = (function(i){
         return function(e){
            pager.setPage(i);
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
             Config.numOfThumbsInRow/2)
      };
      pages[i].style.webkitTransform = 
         "translate("+
         ((Config.pageWidth + Config.intervalOfPages) * i)+"px, 0px)";
      pages[i].style.MozTransform = 
         "translate("+
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
         s7.stepBackPrevAction();
      } else if (currentMode == thumbsMode) {
         pager.prevThumbsPage();
      }
      translatePage();
   }
   function pushRight(){
      if (currentMode == viewMode) {
         s7.doNextAction();
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
      pager.setPage(pager.currentPage);
      currentMode = viewMode;
      translatePage();
   }

   if (!isIPhone) {
      document.addEventListener("keydown", function(e){
         switch(e.keyCode) {
         case keymap.left:
            e.preventDefault();
            pushLeft();
            break;
         case keymap.right:
            e.preventDefault();
            pushRight();
            break;
         case keymap.up:
            e.preventDefault();
            pushUp();
            break;
         case keymap.down:
            e.preventDefault();
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
   setTimeout(pushUp, 200);
}
