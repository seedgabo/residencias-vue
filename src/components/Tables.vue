<template lang="jade">
	div
		v-container(fluid="")
			v-layout(wrap="")
				div(v-show="tab==='visitors'")
					{{api.residence.visitors}}
				div(v-show="tab==='visits'")
					{{api.residence.visits}}
				div(v-show="tab==='parkings'")
					{{api.residence.parkings}}
				div(v-show="tab==='workers'")
					{{api.residence.workers}}
		v-bottom-nav.primary(value="true" light="", :shift="windowWidth<500")
			v-btn(dark=""  @click.native="tab='visitors'", :value="tab==='visitors'")
				span {{api.trans('literals.visitors')}}
				v-icon people
			v-btn(dark=""  @click.native="tab='visits'", :value="tab==='visits'")
				span {{api.trans('literals.visits')}}
				v-icon history
			v-btn(dark=""  @click.native="tab='parkings'", :value="tab==='parkings'")
				span {{api.trans('literals.parkings')}}
				v-icon local_parking
			v-btn(dark=""  @click.native="tab='workers'", :value="tab==='workers'")
				span {{api.trans('literals.workers')}}
				v-icon work
</template>

<script lang="coffee">
module.exports =
	name: 'Tables'
	mounted: ()->
		window.addEventListener('resize', @handleResize)
	beforeDestroy: ()->
		window.removeEventListener('resize', @handleResize)
	data: ->
		api: require '../services/api.js'
		tab: 'visitors'
		windowWidth: document.documentElement.clientWidth
	methods:
		getData: ()->
			@api.get 'data'
			.then (resp)=>
				console.log resp.data
			.catch console.error
		handleResize: (ev)->
			@windowWidth = document.documentElement.clientWidth
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
	
</style>