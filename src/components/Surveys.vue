<template lang="jade">
v-container(fluid="")
	v-layout(wrap="")
		v-flex.text-xs-center(xs12="" sm6="" order-sm1 order-xs2)
			v-progress-circular.primary--text(indeterminate="" v-bind:size="50" v-if="loading")
			v-card.mx-1.elevation-0(v-else)
				v-list(subheader="")
					v-subheader(inset="")  
						span   &nbsp; {{api.trans('literals.surveys')}}
						v-spacer
					v-list-tile(avatar="" v-for="survey in surveys", :key="survey.id" @click="selectSurvey(survey)")
						v-list-tile-avatar
							v-tooltip(right)
								span {{ api.trans('literals.votes') }}
								v-icon(slot="activator") pie_chart
						v-list-tile-content
							v-list-tile-title {{survey.title}}
							v-list-tile-sub-title {{survey.question}}
						v-list-tile-action()
							v-tooltip(left)
								span {{api.trans('literals.close_time')}}
								small(slot="activator") {{survey.close_time | moment('from')}}
		v-flex.text-xs-center(xs12="" sm6="" order-sm2 order-xs1)
			transition(name="zoomin" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut" mode="out-in", :duration="{ enter: 400, leave:400 }")
				v-card.mx-1.elevation-0(v-if="!voting" key="normal")
					div(v-if="survey.id")
						v-card-title 
							h3.headline.primary--text {{survey.question}}
						v-card-text
							pie-chart(:data="data", :colors="colors", :discrete="true", :label="api.trans('literas.votes')", :library="{animation: {duration:700}}", :download="true")
							div.text-capitalize(v-if="response &&  survey['response_'+my_vote.response]")
								b {{ api.trans('literals.your_vote') }}:
								span {{survey['response_'+my_vote.response]}}
							v-btn(success="" v-else @click.stop="voting=true;selectResponse()")
								v-icon(dark="") thumbs_up_down
								span &nbsp; {{api.trans('literals.vote')}}
				v-card.elevation-0(v-else key="edit")
					v-card-title {{survey.question}}
					v-divider
					v-card-text
						v-radio-group(v-model="response")
							v-radio(:label="survey.response_1", value="1" v-if="survey.response_1")
							v-radio(:label="survey.response_2", value="2" v-if="survey.response_2")
							v-radio(:label="survey.response_3", value="3" v-if="survey.response_3")
							v-radio(:label="survey.response_4", value="4" v-if="survey.response_4")
							v-radio(:label="survey.response_5", value="5" v-if="survey.response_5")
							v-radio(:label="survey.response_6", value="6" v-if="survey.response_6")
					v-card-actions
						v-btn.primary--text.darken-1(flat="" @click.native="voting=false") {{ api.trans('crud.cancel') }}
						v-btn.primary--text.darken-1(flat="" @click.native="postVote(survey,response)") {{ api.trans('crud.save') }}
</template>

<script lang="coffee">
window.__ = require('underscore')._
module.exports =
	name: 'Invoices'
	mounted: ()->
		console.log @api
		@getSurveys()
		@$router.app.$on 'surveyUpdated',(survey)=>
			@getSurveys()
			@updateSurvey(survey)
			if survey.id == @survey.id
				@selectSurvey(survey)
	beforeDestroy: ()->
		@$router.app.$off('surveyUpdated')
	data: ->
		api: require '../services/api.js'
		survey:{}
		my_vote:null
		response:0
		surveys: []
		voting:false
		loading:false
		colors: ['#F44336', '#2196F3', '#4CAF50', '#FFEB3B', '#FF5722', '#E91E63', '#9C27B0', '#3F51B5', '#009688'],
		labels:[]
		values:[]
		data:{}
	methods:
		getSurveys: ()->
			@loading=true
			@api.get 'surveys?take=50&orderBy[close_time]=desc'
			.then (resp)=>
				console.log 'surveys', resp.data
				@loading=false
				@surveys=resp.data
			.catch console.error
		getSurvey: (survey)->
			@loading=true
			@api.get """surveys/#{survey.id}"""
			.then (resp)=>
				console.log 'survey', resp.data
				@loading=false
				@survey=resp.data
			.catch console.error
		selectSurvey: (survey)->
			data= []
			if survey.response_1
				data.push [survey.response_1,survey.results[1]]
			if survey.response_2
				data.push [survey.response_2,survey.results[2]]
			if survey.response_3
				data.push [survey.response_3,survey.results[3]]
			if survey.response_4
				data.push [survey.response_4,survey.results[4]]
			if survey.response_5
				data.push [survey.response_5,survey.results[5]]
			if survey.response_6
				data.push [survey.response_6,survey.results[6]]			
			@data=data
			@survey=survey
			@voting=false
			@getVote(survey)
		selectResponse: ()->
			@response= @my_vote?.response
		getVote: (survey)->
			@vote =null
			@api.get("""votes?where[user_id]=#{@api.user.id}&where[survey_id]=#{survey.id}""")
			.then (resp)=>
				console.log 'my vote', resp.data
				@my_vote=resp.data[0]
				@response=@my_vote?.response

		postVote: (survey,response)->
			@api.post('votes',{response:response, user_id: @api.user.id, survey_id: survey.id})
			.then (resp)=>
				console.log resp.data
				@my_vote=resp.data
				@voting=false
				@api.get """surveys/#{survey.id}"""
				.then (resp)=>
					console.log 'survey', resp.data
					@updateSurvey(resp.data)
					@selectSurvey(resp.data)
				.catch console.error
			.catch console.error
		updateSurvey: (newSurvey)->
			index= @surveys.findIndex (surv)->
				return newSurvey.id == surv.id
			if index>-1
				@surveys.splice(index,1,newSurvey)
		
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
