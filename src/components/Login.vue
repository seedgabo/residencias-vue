<template lang="jade">
.login-page
	v-container(fluid='')
		v-layout.text-xs-center
			v-flex
				img.delay.bounceIn.animated(src='../assets/logo-completo.png', alt='', style='height:90px;')
		v-layout
			v-flex.hidden-xs
			v-flex
				v-card.login-card.mt-5(hover='', raised='')
					v-card-title(primary-title='')
						.text-center(style='width:100%')
							h4.headline
								| Login
							v-text-field(name='username', v-model='username', label='username', prepend-icon='account_circle')
							v-text-field(name='password', v-model='password', label='password', prepend-icon='lock', :append-icon="e1 ? 'visibility' : 'visibility_off'", :append-icon-cb='() => (e1 = !e1)', :type="e1 ? 'password' : 'text'")
							v-btn(@click.native='doLogin()', :loading='loging', primary='', block='', v-bind:disabled='password.length <4 || username.length <4')
								| Login
							fb-signin-button(:params='fbSignInParams', @success='onFacebookSignInSuccess', @error='onSignInError')
								v-btn(primary='', flat='')
									v-icon.blue--text fa-facebook-square
									|                       Facebook
							g-signin-button(:params='googleSignInParams', @success='onGoogleSignInSuccess', @error='onSignInError')
								v-btn(danger='', flat='')
									v-icon.red--text fa-google-plus-square
									span.red--text
										| Google
			v-flex.hidden-xs
	v-dialog(v-model="error")
		v-card
			v-card-title.subheader Error
			v-card-text: p {{errorText}}
			v-card-actions
				v-spacer
				v-btn(flat primary dark, @click="error=false") {{api.trans('literals.ok')}}
</template>

<script lang="coffee">
axios = require('axios')
module.exports =
	name: 'login'
	data: ->
		api: require '../services/api.js'
		username:''
		password:''
		e1:true
		loging:false
		error:false
		errorText: "Error"
		fbSignInParams:
			scope: 'email,public_profile,user_birthday'
			return_scopes: true
		googleSignInParams:
			client_id:'425679220353-u39prig4hkrjg592lnppmnbfj6lvi4qk.apps.googleusercontent.com'
	methods:
		doLogin: ()->
			@loging = true;
			axios.get(@api.url + 'login', {
				headers: { 'Authorization': "Basic " + btoa(@username + ':' + @password) }
			})
			.then (response) =>
					@api.ready = new Promise (resolve, reject) =>
						console.log(response.data);
						@loging = false;
						@api.setUser(response.data)
						window.localStorage.setItem('user', JSON.stringify(response.data.user));
						window.localStorage.setItem('residence', JSON.stringify(response.data.residence));
						@getLangs();
						resolve(response.data)
						@$router.push('/');
						@$router.app.$emit('login', response.data)
			.catch (err) =>
				console.error err
				@onError(err)
		getLangs: ()->
			@api.get('lang')
				.then (response) =>
					console.log(response.data);
					@api.i18n = response.data;
					window.localStorage.setItem('i18n', JSON.stringify(response.data));
				.catch console.error
		onFacebookSignInSuccess: (response)->
			FB.api '/me',{ fields: 'name,birthday,email,link,gender,picture' },(fuser)=>
				console.log(fuser)
				@SocialLogin(fuser,'facebook');
				console.log("""Good to see you, ${fuser.name}.""")
		onGoogleSignInSuccess: (googleUser)->
			profile = googleUser.getBasicProfile()
			console.log(profile)
			user=
				name: profile.getName()
				image: profile.getImageUrl()
				email: profile.getEmail()
				google_id: profile.getId()
			@SocialLogin(user,'google')
		onSignInError: (error)->
			console.log('OH NOES', error)
			@error=true
			@errorText="Error en Login"
		onError: (resp,social)->
			console.log resp.response
			@loging=false
			@error=true
			if (social=='facebook'||social=='google')&&resp.response.status==401
				@errorText="Error en autenticación, el usuario no esta registrado"
			else if resp.response.status==401
				@errorText="Usuario y/o contraseña Invalidos"
			else
				@errorText="Error en autenticación: "+resp.response.statusText
		SocialLogin: (user,social)->
			@loging = true
			axios.post(@api.url + 'login/oauth', { email: user.email, user: user })
				.then (response) =>
					@api.ready = new Promise (resolve, reject)=>
						console.log(response.data)
						@loging = false
						@api.setUser(response.data)
						window.localStorage.setItem('user', JSON.stringify(response.data.user))
						window.localStorage.setItem('residence', JSON.stringify(response.data.residence))
						@getLangs();
						resolve(response.data)
						@$router.push('/')
						@$router.app.$emit('login', response.data)
				.catch (err) =>
					console.error(err)
					@onError(err,social)

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login-page,
body {
  background: #fff;
  margin-top: 0px;
  height: 100vh;
  width: 100vw;
  background-image: url(https://s-media-cache-ak0.pinimg.com/originals/d2/b8/fc/d2b8fc669367ac5eac78f9f2d4186913.png);
  background-size: cover;
}

.delay {
  animation-delay: 1s;
}
</style>
