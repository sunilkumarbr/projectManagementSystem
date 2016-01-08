/**********login*************/


		var box=function(){	
			$('#triangle-up').css('left','35px')
						.css('border-bottom-color','#009688');

			$('#loginForm').animate({
				height:450
			},{
			duration:1000,
			
			});
			$('#lForm').css('display','block');
			$('#lEmail').val('');
			$('#lPassword').val('');
			$('#lEmail').focus();
			$('div#signupMessage').css('display','none');
			$('#loader').css('display','none');
		};


		$('#triangle-up').animate({
			borderBottomWidth:30
		},{
			duration:100,
			complete:box
		});

		var logTA=function(){
			$('#triangle-up').css('left','35px')
						.css('border-bottom-color','#009688');
			$('#triangle-up').animate({
				borderBottomWidth:30
			},{
				duration:100,
				complete: box
			});

		};

	var logT=function(){
			$('#triangle-up').animate({
				borderBottomWidth:0
			},{
				duration:100,
				complete: logTA
			});
			$('#sForm').css('display','none');
		};


	$('#login').on('click',function(){
		$('#signupForm').animate({
			height:0
		},{
		duration:1000,
		complete: logT
		});
	});


	$('#cancle').on('click',function(){
		$('#verify').css('display','none');
		$('#signupForm').animate({
			height:0
		},{
		duration:1000,
		complete: logT
		});
		
	});

/**********signup********/


	$('#signupButton').on('click',function(){
		$('#verify').css('display','none');
		$('#loginForm').animate({
			height:0
		},{
		duration:1000,
		complete: triangle
		});
	});

	var triangle=function(){
		$('#triangle-up').animate({
			borderBottomWidth:0
		},{
		duration:50,
		complete:signT
		});
		$('#lForm').css('display','none');
	};


	var signT=function(){
		$('#triangle-up').css('left','96px')
						.css('border-bottom','0px solid #20B2AA');
		$('#triangle-up').animate({
			borderBottomWidth:30
		},{
		duration:100,
		complete:sign
		});
	};

	var sign=function(){
		$('#signupForm').css('display','block');
		$('#signupForm').animate({
				height:320
			},{
			duration:1000,
			});
		$('#sForm').css('display','block');
		$('#sEmail').val('');
		$('#sPassword').val('');
		$('#sEmail').focus();
		$('div#loginMessage').css('display','none');
	};

/**************signup submit***************/
	$('#sSignup').on('click',function(){
			$('#verify').css('display','none');
			$('div#signupMessage').css('display','block');

		if(!$('#sEmail').val().match(/^[a-zA-Z0-9_.]+@[A-Za-z0-9.]+\.[A-Za-z]{2,}$/)){
			$('div#signupMessage').css('color','#B3432B');
			$('div#signupMessage').html('provide the valid email address');
			$('#sEmail').focus();
			return false;
		}
		else if($('#sPassword').val()===''){
			$('div#signupMessage').css('color','#B3432B');
			$('div#signupMessage').html('Password cannot be empty');
			$('#sPassword').focus();
			return false;
		}
		else{
			$('div#signupMessage').css('display','none');
			$('#loader').css('display','block');

			$('#cancle').css('display','none');

			$.post('/signup',{email:$('#sEmail').val(),password:$('#sPassword').val()},function(data){
				$('#loader').css('display','none');
				$('div#signupMessage').css('display','block');
				
				if(data.status===0||data.status===-1){
					$('div#signupMessage').css('color','#B3432B');
					$('div#signupMessage').html(data.result);
					$('#cancle').css('display','block');
					$('#sSignup').css('float','left');
					$('#sSignup').css('margin-left','50px');
					$('#sSignup').css('margin-right','5px');
					$('#loader').css('margin-left','130px');
					$('#loader').css('margin-top','60px');
				}
				else if(data.status===1){
					$('#sEmail').val('');
					$('#sPassword').val('');
					$('#sEmail').focus();
					$('div#signupMessage').css('color','#BCED91');
					$('div#signupMessage').html(data.result);
					$('#cancle').css('display','block');
					$('#sSignup').css('float','left');
					$('#sSignup').css('margin-left','50px');
					$('#sSignup').css('margin-right','5px');

				}
			});
			return false;
		}
	});


/**************login submit***************/
	$('#lsubmit').on('click',function(){
		$('#verify').css('display','none');
		if(!$('#lEmail').val().match(/^[a-zA-Z0-9_.]+@[A-Za-z0-9.]+\.[A-Za-z]{2,}$/)){
			$('#lEmail').focus();
			$('div#loginMessage').html('provide the valid email address');
			$('div#loginMessage').css('color','#B3432B');
			$('div#loginMessage').css('display','block');
			return false;
		}
		else if($('#lPassword').val()===''){
			$('#lPassword').focus();
			$('div#loginMessage').css('color','#B3432B');
			$('div#loginMessage').html('Password cannot be empty');
			$('div#loginMessage').css('display','block');
			return false;
		}

		else{
			$.post('/login',{email:$('#lEmail').val(),password:$('#lPassword').val()},function(data){
				if(data.status===0||data.status===-1){
					if(data.status===0)
					$('#verify').css('display','block');
					$('#lEmail').val('');
					$('#lPassword').val('');
					$('div#loginMessage').html(data.result);
					$('div#loginMessage').css('color','#B3432B');
					$('div#loginMessage').css('display','block');
				}
				else if(data.status===1){
					window.location.href='/u/0/dashboard';
				}
			});
			return false;
		}
	});
/*********************verification link resend********************/

	$('#verify').on('click',function(){
		// alert('implimenting now');
		if($('#lEmail').val()===''){
			$('div#loginMessage').html('enter only mailId with which you have signedUp in email box above and press "send activation link again?" button');
			$('div#loginMessage').css('color','white');
		}
		else{
			$('div#loginMessage').html('');
			$.post('/verifictionLinkResend',{email:$('#lEmail').val()},function(data){
				$('div#loginMessage').html(data.result);
				if(data.status===1)
					$('#verify').css('display','none');
			});
		}
		return false;
	});

