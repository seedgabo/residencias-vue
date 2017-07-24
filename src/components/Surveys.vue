<template lang="jade">
	v-container(fluid="")
		v-layout(wrap="")
			v-flex.text-xs-center(xs12="" sm6="")
				v-progress-circular.primary--text(indeterminate="" v-bind:size="50" v-if="loading")
				v-card(v-else)
					v-list(subheader="")
						v-subheader(inset="")  
							span   &nbsp; {{api.trans('literals.surveys')}}
							v-spacer
						v-list-tile(avatar="" v-for="survey in surveys", :key="survey.id" @click="selectSurvey(survey)")
							v-list-tile-avatar(v-tooltip:right="{html: api.trans('literals.votes')}")
								v-icon(v-badge="{value: survey.surveyuser.length}") pie_chart
							v-list-tile-content
								v-list-tile-title {{survey.title}}
								v-list-tile-sub-title {{survey.question}}
							v-list-tile-action(v-tooltip:left="{html: api.trans('literals.close_time')}")
								small {{survey.close_time | moment('from')}}
			v-flex.text-xs-center(xs12="" sm6="")
				v-card
					div(v-if="survey.id")
						v-card-title 
							h3.headline.primary--text {{survey.question}}
						v-card-text
							<pie-chart :data="data" :colors="colors" :discrete="true" :label="api.trans('literas.votes')" :library="{animation: {duration:700}}" :download="true"></pie-chart>
							v-btn(success="" @click="vote()")
								v-icon(dark="") thumbs_up_down
								span &nbsp; {{api.trans('literals.vote')}}
</template>

<script lang="coffee">
window.__ = require('underscore')._
module.exports =
	name: 'Invoices'
	mounted: ()->
		console.log @api
		@getSurveys()
	data: ->
		api: require '../services/api.js'
		survey:{}
		my_vote:null
		surveys: []
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
		selectSurvey: (survey)->
			@data=[
				[survey.response_1,__.filter(survey.surveyuser,(vote)-> vote.response==1).length]
				[survey.response_2,__.filter(survey.surveyuser,(vote)-> vote.response==2).length]
				[survey.response_3,__.filter(survey.surveyuser,(vote)-> vote.response==3).length]
				[survey.response_4,__.filter(survey.surveyuser,(vote)-> vote.response==4).length]
				[survey.response_5,__.filter(survey.surveyuser,(vote)-> vote.response==5).length]
				[survey.response_6,__.filter(survey.surveyuser,(vote)-> vote.response==6).length]
			]
			@survey=survey
			@getVote(survey)
		getVote: (survey)->
			@vote =null
			@api.get("""votes?where[user_id]=#{@api.user.id}&survey_id=#{survey.id}""")
			.then (resp)=>
				console.log 'my vote', resp.data
				@my_vote=resp.data[0]
		vote: ()->
			@postVote(@survey,1)
		postVote: (survey,response)->
			@api.post('votes',{response:response, user_id: @api.user.id, survey_id: survey.id})
			.then (resp)=>
				console.log resp.data
			.catch console.error
		
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
	
</style>
