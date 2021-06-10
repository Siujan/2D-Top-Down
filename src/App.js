import { useEffect, useState, useRef } from 'react';

function App() {
  const [map,setMap] = useState({});
  const [charSrc,setCharSrc] = useState("./assets/exterior/ (322).png");
  const [collisions,setCollisions] = useState([]);
  const [charCoord,setCharCoord] = useState([8,8]);
  const [charZ,setCharZ] = useState(2);
  const charCoordRef = useRef(charCoord);
  const charZRef = useRef(charZ);
  const mapWidth = 800;
  let walkDelay = false;

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

  useEffect(()=>{
    fetch('/maps/town.json',{
    
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
          levelCollisions.sort((a,b)=> a-b)
        })
        newColisions.push(levelCollisions);
      })
      setCollisions(newColisions);

    })
  },[])

  useEffect(()=>{
    if(collisions.length){

      window.addEventListener('keydown',(e)=>{
        if(!walkDelay){
          let targetIndex;
          let curIndex = charCoordRef.current[1] * map.width_grid + charCoordRef.current[0];
              
          let floorChecker = map.floor.find(e => ( (e.coord[1]-1)*map.width_grid + e.coord[0]-1) == curIndex );
          
          //65 a 87 w  83 s 68 d
          switch(e.keyCode){
            case 65:
              targetIndex = charCoordRef.current[1] * map.width_grid + charCoordRef.current[0]-1;

              if(floorChecker != undefined){
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
              break;
            default:
              break;
          }
          console.log(charZRef)
        }
        
      })
  

    }
  },[map,collisions])

  const styles = {
    view:{
      width: "100vw",
      height: "100vh",
      backgroundColor: "white",
      display:"flex",
      justifyContent:"center",
      alignItems:"center"
    },
    map:{
      position: "absolute",
      display: "grid",
      gridTemplateColumns: "repeat(" + map.width_grid + "," + mapWidth/24 + "px)",
      width: mapWidth*map.width_grid/24,
      zIndex:1
    },
    mapCells:{
      height: mapWidth/24,
    },
    levelTwo:{
      position: "absolute",
      display: "grid",
      gridTemplateColumns: "repeat(" + map.width_grid + "," + mapWidth/24 + "px)",
      width: mapWidth*map.width_grid/24,
      height: mapWidth*map.height_grid/24,
      zIndex: 2  
    },
    levelTwoCells:{
      height:mapWidth/24,
      display:"flex",
      justifyContent: "center",
      alignItems: "center"
    },
    levelThree:{
      position: "absolute",
      display: "grid",
      gridTemplateColumns: "repeat(" + map.width_grid + "," + mapWidth/24 + "px)",
      width: mapWidth*map.width_grid/24,
      height: mapWidth*map.height_grid/24,
      zIndex: 3        
    },
    levelThreeCells:{
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
      zIndex:charZ
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
      <div style={styles.levelTwo}>
        {
          (Object.keys(map).length === 0 && map.constructor === Object) ? <div></div> : 
          map.level2.map((x,i)=>{
            return <img style={ {...styles.levelTwoCells}, {position:"absolute",height:mapWidth*x.size[1]/24,width:mapWidth*x.size[0]/24,left:(x.coord[0]-1)*mapWidth/24,top:(x.coord[1]-1)*mapWidth/24} } src={require("" + x.src).default} />
          })
        }
      </div>
      <div style={styles.levelThree}>
      {
          (Object.keys(map).length === 0 && map.constructor === Object) ? <div></div> : 
          map.level3.map((x,i)=>{
            return <img style={ {...styles.levelThreeCells}, {position:"absolute",height:mapWidth*x.size[1]/24,width:mapWidth*x.size[0]/24,left:(x.coord[0]-1)*mapWidth/24,top:(x.coord[1]-1)*mapWidth/24} } src={require("" + x.src).default} />
          })
        }
      </div>
      <div style= {styles.charMoveArea}>
        <img style={ {  position:"absolute",
                        height:mapWidth/24,
                        width:mapWidth/24,
                        left:charCoord[0]*mapWidth/24,
                        top:charCoord[1]*mapWidth/24 - 12,
                        transition: "all .3s"
                    } } src={require("" + charSrc).default}></img>
      </div>
    </div>
  );
}

export default App;
