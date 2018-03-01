<template lang="jade">
v-container()
	v-layout(wrap="")
		v-flex.text-xs-center(xs12="")
			v-btn(color="primary",v-if="mode!='reservations'", @click="myReservations();mode='reservations'") {{ api.trans('__.mys') }} {{ api.trans('literals.reservations') }}
		v-flex(xs12="" sm12="" m12="")
			v-progress-linear(v-if="loading" v-bind:indeterminate="true")
			transition(name='fadeLeft', enter-active-class='animated zoomIn', leave-active-class='animated zoomOut', mode='out-in', :duration='{ enter: 200, leave:200 }')
				//- List of reservations
				v-layout(key="reservations" v-if="mode=='reservations'")
					v-flex(xs12="")
						v-card
							v-card-title
								v-btn(icon, @click="mode='zones'"): v-icon arrow_back
								span {{api.trans('__.mys')}} {{ api.trans('literals.reservations') }}
							v-card-text
								v-list(three-line)
									v-list-tile(v-for="reserv in my_reservations", :key="reserv.id")
										v-list-tile-avatar(v-if="reserv.zone")
											img(:src="reserv.zone.image_url")
										v-list-tile-content
											v-list-tile-title
												span {{reserv.zone.name }}
											v-list-tile-sub-title
												h3(v-if="reserv.event") {{reserv.event.name}}
												span {{reserv.start | moment('calendar') }} -
												span {{reserv.end  | moment('calendar') }}
												p
													b {{api.trans('literals.quotas')}}: &nbsp;
													span {{reserv.quotas}}
										v-list-tile-action
											v-btn(v-if="canCancel(reserv)" @click="cancelReservation(reserv)") {{ api.trans('crud.cancel') }} {{api.trans('literals.reservation')}}
											small.red--text(v-else) {{ api.trans('__.Ya no es posible cancelar esta reservacion' ) }} (< {{api.settings.hours_to_cancel_reservation || 24}} hrs)
											span {{ api.trans('literals.' + reserv.status) }}

				//- List of Zones
				v-layout(key="zones" v-if="mode=='zones'"  wrap="")
					v-flex(xs12="" sm12="" md6="" v-for="zone in zones", :key="zone.id")
						v-card.mx-1.mt-3
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
											span(v-if="zone.price != 0") &nbsp; {{ zone.price | currency('$', 0, { thousandsSeparator: '.' }) }}
											span(v-if="zone.price == 0") &nbsp; {{api.trans('literals.free')}}
									p
										v-icon.cyan--text(large) event
										span &nbsp;
											b {{ api.trans('date.days')}}:
											span(v-for="day in zone.days", :key="day") {{ api.trans('date.'+day) }} &nbsp;
							v-card-actions
								v-spacer
								v-btn.orange--text(flat large, @click="select(zone)") {{ api.trans('literals.reservate') }}
				//- Picker
				div(v-else-if="mode=='picker'" key="picker")
					v-date-picker.hidden-sm-and-down(v-model="date", :allowed-dates="alloweds" landscape :first-day-of-week="1" locale="es-sp")
					v-date-picker.hidden-md-and-up(v-model="date", :allowed-dates="alloweds", :first-day-of-week="1" locale="es-sp")
					div
						v-spacer
						v-btn(flat color="primary"  @click.native="cancel()" large) {{ api.trans('crud.cancel') }}
						v-btn(flat color="primary"  @click.native="choose()" large) {{ api.trans('literals.choose') }}
				//- list
				v-card(v-else-if="mode=='reservation'" key="reservation")
					v-list(subheader two-line)
						v-subheader
							v-btn(icon, @click="mode='picker'")
								v-icon arrow_back
							span {{api.trans('literals.schedules')}}
							v-spacer
							v-btn(icon, @click="cancel()"): v-icon close
						v-list-tile(v-for="interval in options", :key="interval.id" ,@click.stop="reservate(interval)")
							v-list-tile-avatar
								v-icon(large, :class="interval.reserved?'primary--text':interval.available>0?'green--text':'red--text'") {{ interval.reserved ?'check':interval.available>0?'event_available': 'event_busy'}}
							v-list-tile-content
								v-list-tile-title {{ interval.start | moment('hh:mm A')}} - {{ interval.end | moment('hh:mm A') }}
									small  | {{ zone.price | currency('$', 0, { thousandsSeparator: '.' }) }}
								template(v-if="!interval.reserved")
									v-list-tile-sub-title(v-if="interval.limit_user == 0") {{api.trans('__.cupos ilimitados')}}
									v-list-tile-sub-title(v-else) {{interval.available}}
								template(v-else)
									v-list-tile-sub-title {{api.trans('__.you have a reservation')}}
						div(v-if="options && options.length === 0") {{ api.trans('__.no hay intervalos disponibles para este dia') }}
	v-dialog(v-model="reservation_dialog" fullscreen)
		v-card(v-if="zone && interval")
			v-toolbar.primary(dark)
				v-toolbar-title.title {{ api.trans('literals.reservation') }} {{ zone.name }}
				v-spacer
				v-btn(icon, @click="reservation_dialog=false"): v-icon close
			v-card-text
				v-text-field(v-model="quotas" type="number", value="1", min="1", max="interval.available", :label="api.trans('literals.quota')")
			v-card-actions
				v-spacer
				v-btn(color="primary", :disabled="loading" @click="postReservations(interval,quotas)") {{api.trans('literals.reservate')}}
				v-btn(flat, @click="reservation_dialog=false") {{api.trans('crud.cancel')}}
	v-dialog(v-model="view_reservation" fullscreen)
		v-card(v-if="zone && interval && interval.reserved")
			v-toolbar.purple(dark)
				v-toolbar-title.title {{api.trans('literals.view_resource')}} {{ api.trans('literals.reservation') }} {{ zone.name }}
				v-spacer
				v-btn(icon, @click="view_reservation=false"): v-icon close
			v-card-text
				v-list
					v-divider
					v-list-tile
						v-list-tile-content
							v-list-tile-title
								b  {{api.trans('literals.reservation')}} #
								span {{interval.reservation.id}}
					v-divider
					v-list-tile
						v-list-tile-content
							v-list-tile-title
								b  {{api.trans('literals.quotas')}}
								span {{interval.reservation.quotas}}
					v-divider
					v-list-tile
						v-list-tile-content
							v-list-tile-title
								b  {{api.trans('literals.amount')}}
								span {{interval.reservation.quotas * zone.price | currency('$', 0, { thousandsSeparator: '.' }) }}
					v-divider
				v-list
					v-list-tile
						v-list-tile-content
							v-list-tile-title
								b.text-capitalize {{api.trans('literals.start')}}:
								span.text-capitalize {{ interval.reservation.start | moment('calendar') }}
					v-divider
					v-list-tile
						v-list-tile-content
							v-list-tile-title
								b.text-capitalize {{ api.trans('literals.end') }}:
								span.text-capitalize {{ interval.reservation.end | moment('calendar') }}
					v-divider
			v-card-actions
				v-spacer
				v-btn.danger(light disabled)
					span {{api.trans('crud.cancel')}} {{api.trans('literals.reservation')}}
				v-btn(flat, @click="view_reservation=false") {{api.trans('crud.close')}}
	v-snackbar(:timeout="3000", top right, v-model="saved")
		span {{api.trans('literals.reservation')}} {{api.trans('crud.created')}}
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
		my_reservations: []
		quotas:1
		zone: null
		interval: null
		reservation_dialog:false
		view_reservation:false
		saved:false
		min: moment().startOf('day').toDate()
		max: moment().startOf('day').add(1,'year').toDate()
		mode: 'zones'
		reservations:[]
		collection:{}
		options:[]
		allowed:[]
	methods:
		getData: ()->
			@loading=true
			@api.get 'zones?with[]=image&with[]=schedule&scope[reservable]='
			.then (resp)=>
				@loading=false
				console.log 'zones', resp.data
				@zones=resp.data
				@formatZones()
			.catch console.error
		formatZones: ()->
			@zones.forEach (zone)=>
				if (zone.schedule)
					zone.days = []

					if (zone.schedule.monday.length > 0 && zone.schedule.monday[0] != null)
						zone.days.push('monday')

					if (zone.schedule.tuesday.length > 0 && zone.schedule.tuesday[0] != null)
						zone.days.push('tuesday')

					if (zone.schedule.wednesday.length > 0 && zone.schedule.wednesday[0] != null )
						zone.days.push('wednesday')

					if (zone.schedule.thursday.length > 0 && zone.schedule.thursday[0] != null)
						zone.days.push('thursday')

					if (zone.schedule.friday.length > 0 && zone.schedule.friday[0] != null)
						zone.days.push('friday')

					if (zone.schedule.saturday.length > 0 && zone.schedule.saturday[0] != null )
						zone.days.push('saturday')

					if (zone.schedule.sunday.length > 0 && zone.schedule.sunday[0] != null)
						zone.days.push('sunday')

		cancel: ()->
			@mode= 'zones'
		select: (zone)->
			@mode= 'picker'
			@zone= zone
			# @allowed= @getAvailableDays zone.days
			console.log @allowed
		choose: ()->
			console.log @date
			@renderOptions(@date)
		renderOptions: (date)->
			@loading=true
			@options = []
			@collections = {}
			date = moment(date)
			intervals = @zone.schedule["" + date.locale('en').format('dddd').toLowerCase()];

			intervals.forEach (element)=>
				start = date.clone().startOf('day').add(element[0].split(':')[0], 'hours').add(element[0].split(':')[1], 'minutes')
				end =  date.clone().startOf('day').add(element[1].split(':')[0], 'hours').add(element[1].split(':')[1], 'minutes')
				if(start > moment() and end >moment())
					ref  =
						# available: @zone.limit_user is 0 ? Number.MAX_SAFE_INTEGER : @zone.limit_user
						limit_user: @zone.limit_user
						start: start
						end: end
						ref: start.format("HH:mm")

					@options.push ref
					@collection["" + start.clone().format("HH:mm")] = ref
			@getReservations()
		getReservations: ()->
			date = moment(@date)
			@.api.get("reservations?where[zone_id]=#{@zone.id}&whereDateBetween[start]=#{date.format("YYYY-MM-DD")},#{date.clone().add(1, 'd').format("YYYY-MM-DD")}")
			.then (resp)=>
				@reservations = resp.data;
				resp.data.forEach (reservation)=>
					ref= moment(reservation.start).format("HH:mm")
					@$set(@collection, 'available',@collection[ref].available-reservation.quotas)
					if reservation.user_id == @api.user.id
						@$set(@collection[ref], 'reserved',true)
						@$set(@collection[ref], 'reservation',reservation)
				@mode= 'reservation'
				@loading=false
			.catch console.error
		reservate: (interval)->
			@interval= interval
			console.log @interval
			if interval.reserved?
				return @view_reservation= true
			@reservation_dialog= true
		humanize: (interval)->
			if interval == "60" || interval == 60
				return "1 hora"
			else if interval == "90" || interval == 90
				return "1 hora y media"
			else if interval == "180" || interval == 180
				return "2 horas"
			else if interval == "360" || interval == 360
				return "6 horas"
			else if interval == "720" || interval == 720
				return "12 horas"
			else if interval == "1440" || interval == 1440
				return "24 horas"
			else
				return interval + " " + "minutos"
		postReservations:(interval,quotas)->
			date = moment(@date)
			@loading =true
			@api.post('reservations',
				zone_id: @zone.id
				user_id: @api.user.id
				quotas: quotas
				start: moment(interval.start).local().format('YYYY-MM-DD HH:mm')
				end: moment(interval.end).local().format('YYYY-MM-DD HH:mm')
			)
			.then (data)=>
				console.log data
				@cancel()
				@reservation_dialog = false
				@saved = true
				@loading = false
			.catch (err)=>
				console.error err
				@loading = false

		getAvailableDays: (availables_days) ->
			dates = []
			availables_days.forEach (day) =>
				dates = dates.concat(@getDaysBetweenDates(@min, @max, day))
				return
			dates
		getDaysBetweenDates:(start, end, dayName) ->
			result = []
			days =
				sun: 0
				mon: 1
				tue: 2
				wed: 3
				thu: 4
				fri: 5
				sat: 6
			day = days[dayName.toLowerCase().substr(0, 3)]
			# Copy start date
			current = moment(start).toDate()
			# Shift to next of required days
			current.setDate current.getUTCDate() + (day - current.getUTCDate() + 7) % 7
			# While less than end date, add dates to result array
			while current < new Date(end)
				aux = moment(new Date(+current))
				result.push moment([aux.year(),aux.month(),aux.date()]).toDate()
				current.setDate current.getDate() + 7
			result
		alloweds: (value)->
			# console.log  moment(value).lang("en").format('dddd').toLowerCase(), @zone.days,  moment(value).format('dddd').toLowerCase() in @zone.days
			return moment(value).diff(moment(),'days') < 120 && moment(value).diff(moment(),'days') >= 0 &&  moment(value).lang("en").format('dddd').toLowerCase() in @zone.days
		myReservations:()->
			@api.get("reservations?with[]=zone&with[]=zone.image&with[]=event&whereDategte[start]=#{moment().startOf('day').local().format("YYYY-MM-DD")}")
			.then (resp)=>
				@my_reservations = resp.data
			.catch console.error
		cancelReservation: (reservation)->
			note = prompt(@api.trans('__.Nota de cancelación'))
			@api.put("reservations/#{reservation.id}", { status: 'cancelled', 'note': note})
			.then (resp)=>
				reservation.status = 'cancelled'
				@myReservations()

		canCancel: (reserv)->
			if reserv.status == 'cancelled'
				return false
			hours = @api.settings.hours_to_cancel_reservation
			if not hours?
				hours = 24;
			return moment(reserv.start).subtract(hours, "hours") >= moment()

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
