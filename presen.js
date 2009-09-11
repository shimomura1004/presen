function init(){
   const Config = {
         'pageWidth':800, 'pageHeight':600,
         'intervalOfPages': 20,
         'numOfThumbsInRow': 3,
         'numOfPagesInThumbsPage':9
   }
   const keymap = {'left':37, 'up':38, 'right':39, 'down':40};
   var pagedata;
   var currentPage = 0;
   var currentThumbsPage = 0;

   const viewMode   = 0;
   const thumbsMode = 1;
   var currentMode = viewMode;

   function translatePage() {
      for (var i=0 ; i < pagedata.length ; i++) {
         const pageWidth = Config.pageWidth + Config.intervalOfPages;
         const thumbsPageWidth = pageWidth * (Config.numOfThumbsInRow);

         var x, y;
         var scale;
         switch (currentMode) {
         case viewMode:
            x = pageWidth * (i-currentPage);
            y = pagedata[i].posY;
            scale = 1;
            
            break;
         case thumbsMode:
            defaultX = pagedata[i].thumbPosX;
            defaultY = pagedata[i].thumbPosY;
            scale = 1/Config.numOfThumbsInRow;

            x = defaultX +
               (Math.floor(i/Config.numOfPagesInThumbsPage) -
                currentThumbsPage) *
               (thumbsPageWidth+pageWidth/2);
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
      
      // calculate standard positions for all pages
      var pagedatum = {
         page: pages[i],
         posX: (Config.pageWidth + Config.intervalOfPages) * i,
         posY: 0,
         thumbPosX: 
            (Config.pageWidth + Config.intervalOfPages) *
            (i%Config.numOfThumbsInRow - 1),
         thumbPosY:
            (Config.pageHeight + Config.intervalOfPages) *
            (Math.floor((i % Config.numOfPagesInThumbsPage) /
                        Config.numOfThumbsInRow) - 1)
      };
      pages[i].style.webkitTransform = 
         "scale(1) translate("+pagedatum.posX+"px, "+pagedatum.posY+"px)";


      pagedata[i] = pagedatum;
   }

   document.body.addEventListener("keyup", function(e){
      switch(e.keyCode) {
      case keymap.left:
         if (currentMode == viewMode) {
            if (currentPage > 0) {
               currentPage -= 1;
            }
         } else if (currentMode == thumbsMode) {
            if (currentThumbsPage > 0) {
               currentThumbsPage -= 1;
            }
         }
         translatePage();
         break;

      case keymap.right:
         if (currentMode == viewMode) {
            if (currentPage < pagedata.length-1) {
               currentPage += 1;
            }
         } else if (currentMode == thumbsMode) {
            if (currentThumbsPage <
                Math.floor(pagedata.length/
                           Config.numOfPagesInThumbsPage)) {
                              currentThumbsPage += 1;
                           }
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
