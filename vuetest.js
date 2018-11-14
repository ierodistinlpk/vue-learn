/* -*- encoding:utf-8 -*- */
var users=['usr1','usr2','superhero','boss','genius'];
var statuses=['request','open','in work', 'in test', 'tested', 'closed'];
var data=
    {items:[
	{id:1,summary:'win',description:'defeat all',user:'boss',type:'task',priority:'med',version:'0.3',status:'open'},
	{id:2,summary:'die',description:'lose all',user:'usr1',type:'task',priority:'high',version:'0.3',status:'open'},
	{id:4,summary:'think',description:'thonk idea',user:'boss',type:'task',priority:'low',version:'0.3',status:'tested'},
	{id:6,summary:'task6',description:'just test task\nwith linebreak???',user:'usr2',type:'bug',priority:'low',version:'1',status:'tested'},
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
    props:['data','taskclick','editclick','filterclick','upd','filterfield','fields','statuses','users','current_task','editclick'],
    data:function(){
	return {
	    allowedversions:this.data.map(x=>x[this.filterfield]).filter((value, index, self)=>self.indexOf(value) === index),
	}
    },
    computed:{
	filterlist:function(){//this.upd; //dirty hack to force recomputation =(
			      return  this.data.map(x=>x[this.filterfield]).filter((value, index, self)=>self.indexOf(value) === index).sort()
			     },
	tabledata:function(){console.log(this.users);return transform({items:filter(this.data,this.allowedversions), users:this.users, statuses:this.statuses})},
	filterclass:function(){//this.upd;
			     let res={}
			     for (let i=0;i<this.filterlist.length;i++){
				 res[this.filterlist[i]]=(this.allowedversions.includes(this.filterlist[i]))?'filterallowed':'filterdisabled'
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
	    nextid=Math.max(...this.data.map(e=>e.id))+1;
	    this.editclick({id:nextid});
	},
	editform:function(){this.editclick(this.current_task);}
    },
    template:"<div id='grid'><div><button @click=newtask>new task</button><myfilter :list=filterlist :listclasses=filterclass :field=filterfield :onclick=setallowedversion></myfilter></div><mytable :data=tabledata :taskclick=taskclick :editclick=editclick :cols=statuses></mytable><mydetails v-if=\"current_task != null\" :item=current_task :editclick=editform></mydetails></div>"
});

Vue.component('mytable', {
    props:['data','taskclick','editclick','cols'],
    template:"<div class='mytable'><theader :cols=cols></theader><row v-for=\"user in data.users\" :user=user :key=user.name :taskclick=taskclick :editclick=editclick></row></div>"
});

Vue.component('theader', {
    props:['cols'],
    data:function(){return{classes:['row']}},
    template:"<div :class=classes ><div class='cell' v-for=\"status in cols\" >{{status}}</div></div>"
});

Vue.component('row', {
    props:['user','taskclick','editclick'],
    data:function(){return{expanded:true, classes:['row'],pic:'▼'}},
    methods:{
	collapse:function(){
	    this.expanded=!this.expanded;
	    this.expanded?this.classes.splice(-1,1):this.classes.push('collapsed');
	    this.expanded?this.pic='▼':this.pic='►'
	},
    },
    template:"<div :class=classes><p  @click=collapse>{{pic}} {{ user.name }}</p><cell class='cell' v-for=\"status in Object.keys(user).filter((v)=>v!='name')\" :status=status :key=status :tasks=user[status] :taskheight=40 :taskclick=taskclick :editclick=editclick :user=user.name></cell></div>"
});

Vue.component('cell', {
    props:['status','taskheight','tasks','taskclick','editclick','user'],
    methods:{
	dragenter:function(event){event.preventDefault(); this.$el.classList.add("dropacceptor");},
	dragleave:function(event){event.preventDefault(); this.$el.classList.remove("dropacceptor");},
	dragover:function(event){event.preventDefault();},
	drop:function(event){
	    event.preventDefault();
	    let task=document.getElementById(event.dataTransfer.getData("text")).__vue__;
	   // console.log(task.data);
	    task.data.status=this.status;
	    task.data.user=this.user;
	    this.$el.classList.remove("dropacceptor");
	},
    },
    //{{status}}
    template:"<div  @dragleave.prevent=dragleave @dragenter.prevent=dragenter @dragover=dragover @drop=drop > <task class='task'\
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
	prioclass:function(){return 'prio'+this.data.priority}
    },
    methods:{
	setDraggable:function(event){
	    event.dataTransfer.setData("text", event.target.id);
	},
	show:function(){this.taskclick(this.data)},
	edit:function(){this.editclick(this.data)}	
    },
    template:"<div @dragstart=setDraggable  :draggable='true'  @click=show  :id=data.id><h4><img v-bind:src=typeimg v-bind:class=imgcssclass># <a href='#' @click=edit>{{data.id}}</a></h4><p><span :class=prioclass>&#9670;</span> {{data.summary}}</p><p>version:{{ data.version }}</p></div>",
});

Vue.component('myfilter', {
    props:['list','field','onclick','listclasses'],
    methods:{
	setfilter:function(i){this.onclick(i)}
    },
    template:"<div class='myfilter'><div class='filteritem'>{{field}}:</div><div class='filteritem' :class=listclasses[item] @click='setfilter(item)' v-for=\"item in list\" :key='item'>{{item}}</div></div>"
    
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
    template:"<div class='mydetails'><p> <a href='item.id'> {{item.id}}</a>  <input type='button' value='edit' @click=btnclick> </p><p>{{item.summary}} </p>\
<p class='subhead'>Подробности</p>\
<p>Статус: {{item.status}}</p>\
<p :style=priostyle>priority: {{item.priority}} </p>\
<p>Тип: <img v-bind:src=typeimg v-bind:class=imgcssclass> {{item.type}} </p>\
<p class='subhead'>Люди</p>\
<p>owner: {{item.user}} </p>\
<p class='subhead'>Описание</p>\
<p style='white-space: pre;'>{{item.description}}</p>\
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
    data:{data:data.items, current_task:null, fields:data.fields, statuses:data.statuses, users:data.users, form_task:null,upd:0,filterfield:"version"}
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
