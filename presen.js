function PresenAnimater(){
   this.pointer = 0;
   this.actionStack = [];
}
PresenAnimater.prototype.addAction = function(){
}
PresenAnimater.prototype.doNextAction = function(){
}
PresenAnimater.prototype.stepBackPrevAction = function(){
}

function PresenPager(lastPage, lastThumbsPage, numOfThumbs){ 
   this.adjustThumbsPage = function(){
      this.currentThumbsPage =
      Math.floor(this.currentPage / numOfThumbs);
   };

   this.lastPage = lastPage;
   this.lastThumbsPage = lastThumbsPage;
   this.currentPage = 0;
   this.currentThumbsPage = 0;
   return this;
}
PresenPager.prototype.nextPage = function(){
   if (this.currentPage < this.lastPage-1) {
      this.currentPage++;
      this.adjustThumbsPage();
   }
};
PresenPager.prototype.prevPage = function(){
   if (this.currentPage > 0) {
      this.currentPage--;
      this.adjustThumbsPage();
   }
};
PresenPager.prototype.setPage = function(idx){
   this.currentPage = idx;
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

function initializePresen(pageWidth, pageHeight, numOfThumbsInRow){
   const Config = {
         'pageWidth': pageWidth,
         'pageHeight': pageHeight,
         'numOfThumbsInRow': numOfThumbsInRow,
         'numOfPagesInThumbsPage': Math.pow(numOfThumbsInRow, 2),
         'intervalOfPages': 20,
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
               (thumbsPageWidth+pageWidth/4);
            y = defaultY;
            
            break;
         }

         pagedata[i].page.style.webkitTransform =
            "scale("+scale+") translate("+x+"px, "+y+"px)";
      }
   }

   pages = document.getElementsByClassName('page');
   pagedata = new Array(pages.length);

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
            (Config.pageWidth + Config.intervalOfPages) *
            (i%Config.numOfThumbsInRow - 1),
         thumbPosY:
            (Config.pageHeight + Config.intervalOfPages) *
            (Math.floor((i % Config.numOfPagesInThumbsPage) /
                        Config.numOfThumbsInRow) - 1)
      };
      pages[i].style.webkitTransform = 
         "scale(1) translate("+
         ((Config.pageWidth + Config.intervalOfPages) * i)+"px, 0px)";

      pagedata[i] = pagedatum;
   }

   var pager = new PresenPager(pagedata.length,
                               Math.floor(pagedata.length /
                                          Config.numOfPagesInThumbsPage),
                               Config.numOfPagesInThumbsPage);

   translatePage();
   document.body.addEventListener("keyup", function(e){
      switch(e.keyCode) {
      case keymap.left:
         if (currentMode == viewMode) {
            pager.prevPage();
         } else if (currentMode == thumbsMode) {
            pager.prevThumbsPage();
         }
         translatePage();
         break;

      case keymap.right:
         if (currentMode == viewMode) {
            pager.nextPage();
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
