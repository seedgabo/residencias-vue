<template lang="jade">
	div
		v-container()
			visitors(v-show="tab==='visitors'")
			vehicles(v-show="tab==='vehicles'")
			parkings(v-show="tab==='parkings'")
			workers(v-show="tab==='workers'")
			pets(v-show="tab==='pets'")
		v-bottom-nav.purple(value="true" light="", :shift="windowWidth<500")
			v-btn(dark=""  @click.native="tab='visitors'", :value="tab==='visitors'")
				span {{api.trans('literals.visitors')}}
				v-icon people
			v-btn(dark=""  @click.native="tab='vehicles'", :value="tab==='vehicles'")
				span {{api.trans('literals.vehicles')}}
				v-icon directions_car
			v-btn(dark=""  @click.native="tab='parkings'", :value="tab==='parkings'")
				span {{api.trans('literals.parkings')}}
				v-icon local_parking
			v-btn(dark=""  @click.native="tab='workers'", :value="tab==='workers'")
				span {{api.trans('literals.workers')}}
				v-icon work
			v-btn(dark=""  @click.native="tab='pets'", :value="tab==='pets'")
				span {{api.trans('literals.pets')}}
				v-icon pets
</template>

<script lang="coffee">
Visitors=require '@/components/Visitors'
Vehicles=require '@/components/Vehicles'
Workers=require '@/components/Workers'
Parkings=require '@/components/Parkings'
Pets=require '@/components/Pets'

module.exports =
	name: 'Tables'
	components:
		visitors:Visitors
		vehicles:Vehicles
		workers:Workers
		parkings:Parkings
		pets:Pets
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
