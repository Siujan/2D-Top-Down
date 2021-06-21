import { useEffect, useState, useRef } from 'react';

function App() {
  const [map,setMap] = useState({});
  // main map 381, directRef 1
  // library map 322, directRef 3
  const [charSrc,setCharSrc] = useState("./assets/exterior/ (381).png");
  const charDirectRef = useRef(0);
  const [collisions,setCollisions] = useState([]);
  const [routes,setRoutes] = useState([]);
  //main map 11,9
  //library map 4, 10
  const [charCoord,setCharCoord] = useState([11,9]);
  const [dialog,setDialog] = useState({name:"vincent",chat:"Hi, my name is vincent"});
  const [action,setAction] = useState([]);
  const [charZ,setCharZ] = useState(2);
  const charCoordRef = useRef(charCoord);
  const charZRef = useRef(charZ);
  const mapWidth = 800;
  const [dispBox,setDispBox] = useState(false);
  const dispBoxRef = useRef(dispBox)
  let walkDelay = false;
  let chatIndex = 0;

  const timeOutWalkDelay = (()=>{
    walkDelay = true
    
    setTimeout(()=>{
      walkDelay = false;
    },300)

  })

  const walkAnim = ((srcList)=>{
    srcList.forEach((x,i)=>{

      setTimeout(()=>{
        setCharSrc(x);
      },i*100)
      
    })
  })

  const loadMap = ((mapSrc)=>{
    fetch(mapSrc,{
    
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    
    }).then((res)=>{
      return res.json();
    }).then((myJson)=>{ 
      setMap(myJson);
      
      let newColisions = [];
      
      myJson.collisions.forEach((x)=>{
        let levelCollisions = [];
        x.forEach((xi)=>{
          
          for(let i = xi.coord[1]-1; i<xi.coord[1]-1 + xi.size[1];i++){
            for(let j = xi.coord[0]-1;j<xi.coord[0]-1 + xi.size[0];j++){
              levelCollisions.push(i * myJson.width_grid + j);
            }
          }
        })
        levelCollisions.sort((a,b)=> a-b)
        newColisions.push(levelCollisions);
      })
      setCollisions(newColisions);

      let newActions = []
      myJson.dialogs.forEach((x)=>{
        let levelActions = [];
        x.forEach((xi)=>{
          levelActions.push(
            {
              "index":(xi.coord[1]-1) * myJson.width_grid + (xi.coord[0]-1),
              "name":xi.name,
              "chats":xi.chats
            }
          );
        })
        levelActions.sort((a,b)=>a.index-b.index);
        newActions.push(levelActions);
      })
      setAction(newActions)

      let newRoutes = [];
      myJson.routes.forEach((x)=>{
        let levelRoutes = [];
        x.forEach((xi)=>{
          levelRoutes.push(
            {
              "index":(xi.coords[1]-1) * myJson.width_grid + (xi.coords[0]-1),
              "map":xi.target_map,
              "init_pos":xi.init_pos,
              "dir":xi.dir
            }
          )
        })
        newRoutes.push(levelRoutes)
      })
      setRoutes(newRoutes);
      setCharCoord([myJson.init_pos[0],myJson.init_pos[1]]);
      charCoordRef.current = [myJson.init_pos[0],myJson.init_pos[1]];
      switch(myJson.char_dir){
        case 0:
          setCharSrc("./assets/exterior/ (341).png")
          break;
        case 1:
          setCharSrc("./assets/exterior/ (381).png")
          break;
        case 2:
          setCharSrc("./assets/exterior/ (360).png")
          break;
        case 3:
          setCharSrc("./assets/exterior/ (322).png");
          console.log("looking down")
          break;
        default:
          break;
      }
      charDirectRef.current = myJson.char_dir;
    })
  })

  useEffect(()=>{
    loadMap("/maps/town.json");
  },[])

  useEffect(()=>{

    const handleDown = e =>{
      let targetIndex;

      if(e.keyCode === 32){
        switch(charDirectRef.current){
          case 0:
            targetIndex = charCoordRef.current[1] * map.width_grid + charCoordRef.current[0]-1;
            break;
          case 1:
            targetIndex = (charCoordRef.current[1]-1) * map.width_grid + charCoordRef.current[0];
            break;
          case 2:
            targetIndex = (charCoordRef.current[1]) * map.width_grid + charCoordRef.current[0] + 1;
            break;
          case 3:
            targetIndex = (charCoordRef.current[1]+1) * map.width_grid + charCoordRef.current[0];
            break;
          default:
            break;
        }

        let targetAction = action[charZRef.current-2].find(e => (e.index == targetIndex));
        console.log(targetIndex);
        console.log(targetAction);
        console.log(action)
        if(targetAction != undefined){
          if(chatIndex < targetAction.chats.length){
            setDialog({
              name:targetAction.name,chat:targetAction.chats[chatIndex]
            })
            chatIndex += 1;
            setDispBox(true);
            dispBoxRef.current = true;
            walkDelay = true;
          }else{
            setDispBox(false);
            dispBoxRef.current = false;
            walkDelay = false
            chatIndex = 0;
          }

        }
        
      }

      if(!walkDelay){
        let curIndex = charCoordRef.current[1] * map.width_grid + charCoordRef.current[0];
            
        let floorChecker = map.floor.find(e => ( (e.coord[1]-1)*map.width_grid + e.coord[0]-1) == curIndex );
        //65 a 87 w  83 s 68 d
        switch(e.keyCode){
          case 65:
            targetIndex = charCoordRef.current[1] * map.width_grid + charCoordRef.current[0]-1;
            if(floorChecker !== undefined){
              switch(floorChecker.direction){
                case 0:
                  setCharZ(charZRef.current+1);
                  charZRef.current = charZRef.current + 1;
                  break;
                case 1:
                  setCharZ(charZRef.current-1);
                  charZRef.current = charZRef.current - 1;
                  break;
                default:
                  break;
              }
            }

            if(collisions[charZRef.current-2].find(e => (e == targetIndex)) == undefined){
              setCharCoord([charCoordRef.current[0]-1,charCoordRef.current[1]])
              charCoordRef.current = [charCoordRef.current[0]-1,charCoordRef.current[1]];
              walkAnim(["./assets/exterior/ (340).png","./assets/exterior/ (342).png","./assets/exterior/ (341).png"])
              timeOutWalkDelay();
            }else{
              setCharSrc("./assets/exterior/ (341).png")
            }
            charDirectRef.current = 0;
            break;
          case 87:
            targetIndex = (charCoordRef.current[1]-1) * map.width_grid + charCoordRef.current[0];
            if(collisions[charZRef.current-2].find(e => (e == targetIndex)) == undefined){
              setCharCoord([charCoordRef.current[0],charCoordRef.current[1]-1])
              charCoordRef.current = [charCoordRef.current[0],charCoordRef.current[1]-1];
              walkAnim(["./assets/exterior/ (380).png","./assets/exterior/ (382).png","./assets/exterior/ (381).png"])
              timeOutWalkDelay();
            }else{
              setCharSrc("./assets/exterior/ (381).png")
            }
            charDirectRef.current = 1;
            break;
          case 83:
            targetIndex = (charCoordRef.current[1]+1) * map.width_grid + charCoordRef.current[0];
            if(collisions[charZRef.current-2].find(e => (e == targetIndex)) == undefined){
              setCharCoord([charCoordRef.current[0],charCoordRef.current[1]+1])
              charCoordRef.current = [charCoordRef.current[0],charCoordRef.current[1]+1];
              walkAnim(["./assets/exterior/ (321).png","./assets/exterior/ (323).png","./assets/exterior/ (322).png"])
              timeOutWalkDelay();            
            }else{
              setCharSrc("./assets/exterior/ (322).png")
            }
            charDirectRef.current = 3;
            break;
          case 68:
            targetIndex = (charCoordRef.current[1]) * map.width_grid + charCoordRef.current[0] + 1;

            if(floorChecker != undefined){
              switch(floorChecker.direction){
                case 0:
                  setCharZ(charZRef.current-1);
                  charZRef.current = charZRef.current - 1;
                  break;
                case 1:
                  setCharZ(charZRef.current+1);
                  charZRef.current = charZRef.current + 1;
                  break;
                default:
                  break;
              }
            }

            if(collisions[charZRef.current-2].find(e => (e == targetIndex)) == undefined){
              setCharCoord([charCoordRef.current[0]+1,charCoordRef.current[1]])
              charCoordRef.current = [charCoordRef.current[0]+1,charCoordRef.current[1]];
              walkAnim(["./assets/exterior/ (359).png","./assets/exterior/ (361).png","./assets/exterior/ (360).png"])
              timeOutWalkDelay();
            }else{
              setCharSrc("./assets/exterior/ (360).png")
            }
            charDirectRef.current = 2;
            break;
          default:
            break;
        }
        
        let routeCheck = routes[charZRef.current-2].find(e=> (e.index === targetIndex));
        if(routeCheck !== undefined ){
          /*
          setCharCoord([routeCheck.init_pos[0],routeCheck.init_pos[1]])
          console.log(routeCheck.dir)
          switch(routeCheck.dir){
            case 0:
              setCharSrc("./assets/exterior/ (341).png")
              break;
            case 1:
              setCharSrc("./assets/exterior/ (381).png")
              break;
            case 2:
              setCharSrc("./assets/exterior/ (322).png")
              break;
            case 3:
              setCharSrc("./assets/exterior/ (360).png")
              break;
            default:
              break;
          }
          */
          loadMap(routeCheck.map);
        }

      }
      
    }

    if(collisions.length){

      window.addEventListener('keydown',handleDown)

      return () => {
        window.removeEventListener("keydown",handleDown)
      }

    }
  },[map,collisions,routes,action])

  const styles = {
    view:{
      width: "100vw",
      height: "100vh",
      backgroundColor: "black",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
    },
    map:{
      position: "absolute",
      display: "grid",
      gridTemplateColumns: "repeat(" + map.width_grid + "," + mapWidth/24 + "px)",
      width: mapWidth*map.width_grid/24,
      height: mapWidth*map.height_grid/24,
      zIndex:1
    },
    mapCells:{
      height: mapWidth/24,
    },
    objects:{
      position: "absolute",
      display: "grid",
      gridTemplateColumns: "repeat(" + map.width_grid + "," + mapWidth/24 + "px)",
      width: mapWidth*map.width_grid/24,
      height: mapWidth*map.height_grid/24
    },
    objectsItem:{
      height:mapWidth/24,
      display:"flex",
      justifyContent: "center",
      alignItems: "center"
    },
    charMoveArea:{
      position: "absolute",
      display: "grid",
      gridTemplateColumns: "repeat(" + map.width_grid + "," + mapWidth/24 + "px)",
      width: mapWidth*map.width_grid/24,
      height: mapWidth*map.height_grid/24,
      zIndex:charZ,
    },
    dialogContainer:{
      position: "absolute",
      width: mapWidth*map.width_grid/24,
      height: mapWidth*map.height_grid/24,
      zIndex:5
    },
    dialogBox:{
      display:(dispBox) ? "block" : "none",
      bottom:25,
      position:"absolute",
      marginRight:30,
      marginLeft:30,
      width:"calc(100% - 60px)",
      height:150,
      borderRadius:10,
      border: "10px solid #b65505",
      backgroundColor:"#f1ae64",
      overflow:"hidden",
      padding:0
    },
    dialogName:{
      backgroundColor: "#b65505",
      width:"100%",
      fontSize: 30,
      color:"#f1ae64",
      paddingLeft: 30,
      paddingBottom: 10,
      paddingTop:0,
      margin:0,
      fontWeight:500
    },
    chat:{
      color:"#b65505",
      paddingLeft: 30,
      width:"100%",
      fontWeight:500
    }

  }

  return (
    <div style={styles.view}>
      <div style={styles.map}>
        {          
          (Object.keys(map).length === 0 && map.constructor === Object) ? <div></div> : 
            map.grounds.map((x)=>{
              let outputDiv = [];
              for(let j = 0;j<x.count;j++){
                outputDiv.push(<img style={styles.mapCells} src={require("" + x.src).default} />)
              }
              return outputDiv
            })
          }
      </div>
        
      {
        (Object.keys(map).length === 0 && map.constructor === Object) ? <div></div> :
          (map.objects.map((x,i)=>{
            return <div style={{...styles.objects,zIndex:i+2}}>
              {
                x.map((xi)=>{
                  return <img style={ {...styles.levelTwoCells}, {position:"absolute",height:mapWidth*xi.size[1]/24,width:mapWidth*xi.size[0]/24,left:(xi.coord[0]-1)*mapWidth/24,top:(xi.coord[1]-1)*mapWidth/24} } src={require("" + xi.src).default} />
                })              
              }
            </div>
          }))
      }
    
      <div style= {styles.charMoveArea}>
        <img style={ {  position:"absolute",
                        height:mapWidth/24,
                        width:mapWidth/24,
                        left:charCoord[0]*mapWidth/24,
                        top:charCoord[1]*mapWidth/24,
                        transition: "all .3s"
                    } } src={require("" + charSrc).default}></img>
      </div>
                    

      <div style={{...styles.dialogContainer}}>
        <div style={styles.dialogBox}>
          <h1 style={styles.dialogName}>{dialog.name}</h1>
          <p style={styles.chat}>{dialog.chat}</p>   
        </div>
      </div>              
 

    </div>
  );
}

export default App;
