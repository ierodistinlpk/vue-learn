/* -*- encoding:utf-8 -*- */
var users=['usr1','usr2','superhero','boss','genius'];
var statuses=['request','open','in work', 'in test', 'tested', 'closed'];
var data=
    {items:[
	{id:1,summary:'win',description:'defeat all',user:'boss',type:'task',priority:'med',version:'0.3',status:'open'},
	{id:2,summary:'die',description:'lose all',user:'usr1',type:'task',priority:'high',version:'0.3',status:'open'},
	{id:4,summary:'think',description:'thonk idea',user:'boss',type:'task',priority:'low',version:'0.3',status:'tested'},
	{id:6,summary:'task6',description:'just test task',user:'usr2',type:'bug',priority:'low',version:'1',status:'tested'},
	{id:7,summary:'win',description:'defeat boss',user:'superhero',type:'bug',priority:'high',version:'0.5',status:'in work'},
	{id:11,summary:'task',description:'task',user:'boss',type:'task',priority:'low',version:'0.3',status:'open'},

    ],
     fields:[
	 {name:'id',display:'#',type:'ro'},
	 {name:'summary',display:'заголовок',type:'string'},
	 {name:'description',display:'описание',type:'multistring'},
	 {name:'user',display:'назначено',type:'enum',values:users},
	 {name:'type',display:'тип',type:'enum',values:['task','bug']},
	 {name:'priority',display:'приоритет',type:'enum',values:['low','med','high']},
	 {name:'version',display:'версия продукта',type:'string'},
	 {name:'status',display:'статус',type:'enum',values:statuses},
     ],
     users:users,
     statuses:statuses
    };

Vue.component('grid', {
    props:['data','taskclick','editclick','filterclick','upd','filterfield'],
    data:function(){
	return {
	    allowedversions:data.items.map(x=>x[this.filterfield]).filter((value, index, self)=>self.indexOf(value) === index),
	}
    },
    computed:{
	filterlist:function(){this.upd; //dirty hack to force recomputation =(
			      return  data.items.map(x=>x[this.filterfield]).filter((value, index, self)=>self.indexOf(value) === index).sort()
			     },
	tabledata:function(){this.upd; return transform({items:filter(data.items,this.allowedversions),users:data.users,statuses:data.statuses})},
	filterstyle:function(){this.upd;
			     let res={}
			     for (let i=0;i<this.filterlist.length;i++){
				 res[this.filterlist[i]]=(this.allowedversions.includes(this.filterlist[i]))?{color:'green'}:{color:'gray'}
			     }
			     return res;
			    }
    },
    methods:{
	setallowedversion:function(v){let index=this.allowedversions.indexOf(v);
				      (index==-1)?this.allowedversions.push(v):this.allowedversions.splice(index,1);
				      this.allowedversions=this.allowedversions.slice(0);
				      console.log(this.allowedversions);
				     },
	newtask:function(){
	    nextid=Math.max(...data.items.map(e=>e.id))+1;
	    this.editclick({id:nextid});
	}
    },
    template:"<div id='grid'><button @click=newtask>new task</button><myfilter :list=filterlist :liststyles=filterstyle :field=filterfield :onclick=setallowedversion></myfilter><mytable :data=tabledata :taskclick=taskclick :editclick=editclick></mytable></div>"
});

Vue.component('mytable', {
    props:['data','taskclick','editclick'],
    template:"<div class='mytablte'><row v-for=\"user in data.users\" :user=user :key=user.name :taskclick=taskclick :editclick=editclick></row></div>"
});

Vue.component('row', {
    props:['user','taskclick','editclick'],
    template:"<div class='row'><p>{{ user.name }}</p><cell class='cell' v-for=\"status in Object.keys(user).filter((v)=>v!='name')\" :status=status :key=status :tasks=user[status] :taskheight=80 :taskclick=taskclick :editclick=editclick :user=user.name></cell></div>"
});

Vue.component('cell', {
    props:['status','taskheight','tasks','taskclick','editclick','user'],
    computed:{
	divstyle:function(){return {'min-height':(Math.max(this.tasks.length,1)*this.taskheight)+"px"}}
    },

    methods:{
	dragenter:function(event){event.preventDefault(); this.$el.style.color="#ffdddd";},
	dragleave:function(event){event.preventDefault(); this.$el.style.color=null;},
	dragover:function(event){event.preventDefault();},
	drop:function(event){
	    event.preventDefault();
	    let task=document.getElementById(event.dataTransfer.getData("text")).__vue__;
	    console.log(task.data);
	    task.data.status=this.status;
	    task.data.user=this.user;
	    this.$el.style.color=null;
	},
    },
    template:"<div :style=divstyle @dragleave.prevent=dragleave @dragenter.prevent=dragenter @dragover=dragover @drop=drop >{{status}} <task class='task'\
		v-for=\"task in tasks\"\
		:data=task\
		:key=task.id\
		:taskclick=taskclick\
		:editclick=editclick></task></div>",
});


Vue.component('task', {
    props:['data','taskclick','editclick'],
    computed:{
	typeimg:function(){return'img/'+this.data.type+'.png'},
	imgcssclass:function(){return 'icon'},
	priostyle:function(){let colors={low:'green',med:'orange',high:'red'}; return {color:colors[this.data.priority]}}
    },
    methods:{
	setDraggable:function(event){
	    event.dataTransfer.setData("text", event.target.id);
	},
	show:function(){this.taskclick(this.data)},
	edit:function(){this.editclick(this.data)}	
    },
    template:"<div @dragstart=setDraggable  :draggable='true'  @click=show  :id=data.id><h3 ><img v-bind:src=typeimg v-bind:class=imgcssclass><span @click=edit># {{data.id}}</span></h3><p><span :style=priostyle>&#9670;</span> {{data.summary}}</p><p>version:{{ data.version }}</p></div>",
});

Vue.component('myfilter', {
    props:['list','field','onclick','liststyles'],
    methods:{
	setfilter:function(i){this.onclick(i)}
    },
    template:"<div class='myfilter'>{{field}}: <div class='filteritem' :style=liststyles[item] @click='setfilter(item)' v-for=\"item in list\" :key='item'>{{item}}</div></div>"
    
});

Vue.component('taskform', {
    props:['fields','task','closeclick','saveclick'],
    data:function(){return {state:Object.assign({},this.task)} },
    methods:{
	save:function(){
	    console.log(this.state.status);
	    this.saveclick(this.state)
	},
    },
    template:"<div class='modal'><div class='taskform'><h2>Edit Task</h2><table><tr v-for=\"field in fields\"><td valign='top'>{{field.display}}</td><td> \
<input v-if=\"field.type=='string'\" v-model=state[field.name] />\
<textarea v-if=\"field.type=='multistring'\" v-model=state[field.name] />\
<select v-if=\"field.type=='enum'\" v-model=state[field.name]><option disabled>-select-</option><option v-for=\"val in field.values\">{{val}}</option></select>\
<label v-if=\"field.type=='ro'\">{{state[field.name]}}</label></p>\
</td></tr></table><input type='button' value='save' @click=save><input type='button' value='cancel' @click='closeclick'></p></div></div>"
});

Vue.component('mydetails', {
    props:['item','editclick'],
    computed:{
	typeimg:function(){return'img/'+this.item.type+'.png'},
	imgcssclass:function(){return 'icon'},
	priostyle:function(){let colors={low:'green',med:'orange',high:'red'}; return {color:colors[this.item.priority]}}
    },
    methods:{
	btnclick:function(){this.editclick(this.item)}
    },
    template:"<div class='mydetails'><h3>#{{item.id}}: {{item.summary}} <input type='button' value='edit' @click=btnclick></h3>\
<p><img v-bind:src=typeimg v-bind:class=imgcssclass> {{item.type}} {{item.status}}</p>\
<p>owner: {{item.user}} </p>\
<p :style=priostyle>priority: {{item.priority}} </p>\
<p style='white-space: pre;'><b>{{item.description}}</b> </p>\
<p>version: {{item.version}}</p>\
</div>"
});


var app = new Vue({
    el: '#app',
    methods:{
	taskclick:function(task){this.current_task=task;},
	editform:function(task){this.form_task=task;},
	closeform:function(){this.form_task=null},
	saveform:function(task){
	    let x=data.items.findIndex((item)=>{return item.id==task.id});
	    if (x!=-1)
		data.items.splice(x,1,task);
	    else
		data.items.push(task);
	    this.data=data.items.slice(0);
	    this.form_task=null;
	    this.current_task=task;
	    this.upd++
	},
    },
    data:{data:data.items,current_task:null,fields:data.fields, form_task:null,upd:0,filterfield:"version"}
});


//{name:usr,status1:[{id,summary,descr,prior,version}],status2:[], status3:[]}
function transform(data){
    //console.log('transforming');
    let res=[]
    for (let i=0;i<data.users.length;i++){
	let u={name:data.users[i]};
	for (let j=0;j<data.statuses.length;j++){
	    u[statuses[j]]=data.items.filter((v)=>{return v.user==users[i] && v.status==statuses[j]});
	}
	res.push(u);
    }
    return {users:res};
}

//filter by version
function filter(items,allowedversions){
    if(allowedversions){
	let res= items.filter((item)=>{return allowedversions.indexOf(item.version)!=-1});/*item.version==allowedversions});*/
	return res;
    }
    else
	return items;
};
