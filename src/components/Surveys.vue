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
				transition(name="zoomin" enter-active-class="animated slideInRight" leave-active-class="animated slideOutRight" mode="out-in", :duration="{ enter: 500, leave:500 }")
					v-card(v-if="!voting" key="normal")
						div(v-if="survey.id")
							v-card-title 
								h3.headline.primary--text {{survey.question}}
							v-card-text
								<pie-chart :data="data" :colors="colors" :discrete="true" :label="api.trans('literas.votes')" :library="{animation: {duration:700}}" :download="true"></pie-chart>
								v-btn(success="" @click.stop="voting=true")
									v-icon(dark="") thumbs_up_down
									span &nbsp; {{api.trans('literals.vote')}}
					v-card(v-else key="edit")
						v-card-title {{survey.question}}
						v-divider
						v-card-text
							v-radio(:label="survey.response_1", value="1" v-model="response")
							v-radio(:label="survey.response_2", value="2" v-model="response")
							v-radio(:label="survey.response_3", value="3" v-model="response")
							v-radio(:label="survey.response_4", value="4" v-model="response")
							v-radio(:label="survey.response_5", value="5" v-model="response")
							v-radio(:label="survey.response_6", value="6" v-model="response")
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
			@data=[
				[survey.response_1,__.filter(survey.surveyuser,(vote)-> vote.response==1).length]
				[survey.response_2,__.filter(survey.surveyuser,(vote)-> vote.response==2).length]
				[survey.response_3,__.filter(survey.surveyuser,(vote)-> vote.response==3).length]
				[survey.response_4,__.filter(survey.surveyuser,(vote)-> vote.response==4).length]
				[survey.response_5,__.filter(survey.surveyuser,(vote)-> vote.response==5).length]
				[survey.response_6,__.filter(survey.surveyuser,(vote)-> vote.response==6).length]
			]
			@survey=survey
			@voting=false
			@getVote(survey)
		getVote: (survey)->
			@vote =null
			@api.get("""votes?where[user_id]=#{@api.user.id}&survey_id=#{survey.id}""")
			.then (resp)=>
				console.log 'my vote', resp.data
				@my_vote=resp.data[0]
				@response=resp.data[0]?.response

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
