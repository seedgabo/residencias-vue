<template lang="jade">
	v-container()
		v-layout(wrap="")
			v-flex(xs12="" sm12="" md6="" offset-md3="")
				v-progress-linear(v-if="loading" v-bind:indeterminate="true")
				transition(name='fadeLeft', enter-active-class='animated zoomIn', leave-active-class='animated zoomOut', mode='out-in', :duration='{ enter: 200, leave:200 }')
					//- List of Zones
					v-card(v-for="zone in zones" v-if="mode=='zones'" key="zones")
						v-card-media.white--text(height="150px", :src="zone.image_url")
							v-container(fill-height fluid)
								v-layout(fill-height)
									v-flex(xs12="" align-end flexbox)
										span.headline {{zone.name}}
						v-card-title 
							div
								p 
									v-icon.green--text(large) nature
									span  &nbsp; {{zone.name}}
								p(v-if="zone.description")
									v-icon.orange--text(large) event_note
									span  &nbsp; {{zone.description}}
								p
									v-icon.primary--text(large) attach_money
									span &nbsp;
										b {{api.trans('literals.price')}}:
										span(v-if="zone.price != 0") &nbsp; {{zone.price | currency}}
										span(v-if="zone.price == 0") &nbsp; {{api.trans('literals.free')}}
								p
									v-icon.pink--text(large) schedule
									span &nbsp;
										b {{api.trans('literals.schedule')}}:
										span &nbsp; {{[zone.start, ['HH:mm'] ]| moment('hh:mm A')}}
										span(v-if="zone.end")  - {{[ zone.end, ['HH:mm'] ] | moment('hh:mm A')}}
						v-card-actions
							v-spacer
							v-btn.orange--text(flat large, @click="select(zone)") {{ api.trans('literals.reservate') }}
					div(v-else-if="mode=='picker'" key="picker")
						v-date-picker.hidden-sm-and-down(v-model="date" landscape)
						v-date-picker.hidden-md-and-up(v-model="date")
						div
							v-spacer
							v-btn(flat primary @click.native="cancel()" large) {{ api.trans('crud.cancel') }}
							v-btn(flat primary @click.native="choose()" large) {{ api.trans('literals.choose') }}
					v-card(v-else-if="mode=='reservation'" key="reservation")
						v-list(subheader two-line)
							v-subheader
								v-btn(icon, @click="mode='picker'")
									v-icon arrow_back 
								span {{api.trans('literals.schedules')}}
								v-spacer
								v-btn(icon, @click="cancel()"): v-icon close
							v-list-tile(v-for="interval in options")

								v-list-tile-avatar
									v-icon(large, :class="interval.reserved?'primary--text':interval.available>0?'green--text':'red--text'") {{ interval.reserved ?'check':interval.available>0?'event_available': 'event_busy'}}
								
								v-list-tile-content
									v-list-tile-title {{ interval.time | moment('hh:mm A')}}
									template(v-if="!interval.reserved")
										v-list-tile-sub-title(v-if="interval.limit_user == 0") {{api.trans('__.cupos ilimitados')}}
										v-list-tile-sub-title(v-else) {{interval.available}}
									template(v-else)
										v-list-tile-sub-title {{api.trans('__.you have a reservation')}}

</template>

<script lang="coffee">
api = require '../services/api.js'
moment = require 'moment'
module.exports =
	name: 'Reservations'
	mounted: ()->
		console.log @api
		@getData()
	data: ->
		loading:false
		api: api
		date: new Date()
		zones: []
		zone: null
		mode: 'zones'
		reservations:[]
		collection:{}
		options:[]
	methods:
		getData: ()->
			@loading=true
			@api.get 'zones?scope[reservable]='
			.then (resp)=>
				@loading=false
				console.log 'zones', resp.data
				@zones=resp.data
			.catch console.error
		cancel: ()->
			@mode= 'zones'
		select: (zone)->
			@mode= 'picker'
			@zone= zone
			console.log zone
		choose: ()->
			console.log @date
			@renderOptions(@date)
		renderOptions: (date)->
			@loading=true
			@options = []
			@collections = {}
			time = moment(@zone.start, 'HH:mm')
			end = moment(@zone.end, 'HH:mm')
			console.log time, end
			if time < end and @zone.interval > 0
				loop
					ref = 
						available: if @zone.limit_user in [0,"0"] then Number.MAX_SAFE_INTEGER else @zone.limit_user
						limit_user: @zone.limit_user
						time: time.clone()
						ref: time.clone().format('HH:mm')
					@options[@options.length] = ref
					@collection['' + time.clone().format('HH:mm')] = ref
					time = time.add(@zone.interval, 'm')
					break unless(time <= end)
				@getReservations()
		getReservations:()->
			date = moment.utc(@date)
			@.api.get("reservations?where[zone_id]=#{@zone.id}&whereDateBetween[start]=#{date.format("YYYY-MM-DD")},#{date.clone().add(1, 'd').format("YYYY-MM-DD")}")
			.then (resp)=>
				@reservations = resp.data;
				resp.data.forEach (reservation)=>
					ref= moment.utc(reservation.start).format("HH:mm")
					@$set(@collection, 'available',@collection[ref].available-reservation.quotas)
					if reservation.user_id == @api.user.id
						@$set(@collection[ref], 'reserved',true)
						@$set(@collection[ref], 'reservation',reservation)
					console.log(@collection[ref])
				@mode= 'reservation'
				@loading=false
			.catch console.error
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
	
</style>