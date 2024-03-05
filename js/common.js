
 var offsetToStickyBar = 644;
if($(".stickyBar").offset()) {
  offsetToStickyBar = $(".stickyBar").offset().top - $(".navbar").height();
}
$(document).scroll(function(){
    if($(this).scrollTop() > offsetToStickyBar)
    {   
       $('#stickyBar').addClass('stickyBarFixed');
         $(".navbar").hide();
    } else {
       $('#stickyBar').removeClass('stickyBarFixed');
        $(".navbar").show();
    }
});
