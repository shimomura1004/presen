function init(){
   const Config = {
         'pageWidth':800, 'pageHeight':600,
         'intervalOfPages': 20,
         'numOfThumbsInRow': 3
   }
   const keymap = {'left':37, 'up':38, 'right':39, 'down':40};
   var pagedata;
   var currentPage = 0;

   const viewMode   = 0;
   const thumbsMode = 1;
   var currentMode = viewMode;

   function setPageTo(idx, scale){
      scale = scale ? scale : 1;

      for (var i=0 ; i < pagedata.length ; i++) {
         pagedata[i].page.style.webkitTransform = 
            "scale("+scale+") translate("+
            ((Config.pageWidth+Config.intervalOfPages) * (i-idx))+"px, 0px)";
      }
   }


   function adjustPagePositions(xname, yname, scale){
      scale = scale ? scale : 1;

      for (var i=0 ; i < pagedata.length ; i++) {
         pagedata[i].page.style.webkitTransform = 
            "scale("+scale+") translate("+
            pagedata[i][xname]+"px, "+pagedata[i][yname]+"px)";
      }
   }

   
   pages = document.getElementsByClassName('page');
   var numOfPagesInThumbsPage =
      Config.numOfThumbsInRow * Config.numOfThumbsInRow;
   pagedata = new Array(pages.length);

   for (var i=0 ; i < pages.length ; i++) {
      pages[i].style.zIndex = 1000-i;
      pages[i].style.top  = (window.innerHeight-Config.pageHeight)/2;
      pages[i].style.left = (window.innerWidth-Config.pageWidth)/2;
      
      var pagedatum = {
         page: pages[i],
         posX: (Config.pageWidth + Config.intervalOfPages) * i,
         posY: 0,
         thumbPosX:
         Math.floor(i / numOfPagesInThumbsPage) *
            (Config.pageWidth*(Config.numOfThumbsInRow+0.5)) +
            (Config.pageWidth + Config.intervalOfPages)*(i%Config.numOfThumbsInRow-1),
         thumbPosY:
            (Config.pageHeight + Config.intervalOfPages) *
            (Math.floor((i % numOfPagesInThumbsPage) / Config.numOfThumbsInRow) - 1)
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
            setPageTo(currentPage);
         }
         break;

         case keymap.right:
         if (currentMode == viewMode) {
            if (currentPage < pagedata.length-1) {
               currentPage += 1;
            }
            setPageTo(currentPage);
         }
         break;

         case keymap.up:
         currentMode = thumbsMode;
         adjustPagePositions("thumbPosX", "thumbPosY", 1/Config.numOfThumbsInRow);
         break;

         case keymap.down:
         currentMode = viewMode;
         setPageTo(currentPage);
         break;
      }
   }, false);
}
