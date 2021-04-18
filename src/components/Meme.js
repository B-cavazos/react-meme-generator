import {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

const Meme = () => {
    const [meme, setMeme]=useState([]) //refrences an ENTIRE meme object
    const [memeData, setMemeData] = useState([]); //holds the state of API data
/*  const [memeIndex, setMemeIndex] = useState(0);   //holds the state of a randomized meme, removed during tut*/
    const [captions, setCaptions] = useState([]);
    let history = useHistory(); //using useHistory() instead of <Link> -- hook access state of router & perform nav from inside ur components.

/*    ------ FETCHING DATA: THEN-CATCH  METHOD ------
    useEffect(()=>{ //useEffect to pull data from API
                    //chaining methods: fetch('the-data').then(doThis=>{action}).catch(if-error=>{do-instead});
                    //fetch goes out to grab data, is ASYNC 
        fetch('https://api.imgflip.com/get_memes')
        .then(response =>{
            return response.json();     //.json() formats this data to be better readable
        }).then(response=>{
            console.log('after the res.json()', response);
            const {memes} = response.data;      // destructuring: calling the [{memes}] array that lives in [response.data]
            // console.log(memes);
            setMemeData(memes);      //takes memeData array and sets it to memes inside of useState
        }).catch(err=>{
            console.log(err);
        });     
    },[]); */


/*     ----- FETCHING DATA: ASYNC-AWAIT METHOD ------ */
    useEffect(()=>{
      const fetchMemes = async () => {
        try{
            let response = await fetch('https://api.imgflip.com/get_memes');
            response = await response.json();
            // console.log('after the await for json()', response);
            const { memes } = response.data;
            setMemeData(memes);
            // console.log(memes);
            setMeme(memes[0]);
        } catch (error) {
            console.log(error);
        }
    };

        fetchMemes();    
    },[]);

/*     ----- USED TO CREATE CAPTIONS SECTION OF COMPONENT W/O CALLING THE API   ------ */
    useEffect(()=>{
        if (meme.id){ //if there is a meme in the component
            let caps = [];

            for (let i = 0; i< meme.box_count; i++){ //for every box_count in meme
                caps.push('') //push an empty sting into [caps]
            }

        setCaptions(caps); //put caps onto state
        // console.log(caps);
        }
    },[meme]); //tigger evertime meme runs

    /* --- RANDOMIZING the index and using that random meme and set it to the Component --- */
    const setMemeComponent = () =>{
        const randNum = Math.floor(Math.random()*memeData.length);
        setMeme(memeData[randNum])
    };

    /* --- FUNCTION USED TO DYNAMICALLY UPDATE CAPTIONS --- */
    const updateCaptions = (e, index) =>{
        const text = e.target.value || ''; //save value of e (typed text in input) to a text string || set as empty string
        let updatedCaps = captions.map((c, i)=>{ // loop through [captions]
            if(index === i){ 
                return text;
            }else{
                return c 
            }
        });
        // console.log(updatedCaps);
        setCaptions(updatedCaps);
    };

    /* --- FUNCTION TO TAKE CAPTION DATA AND SEND BACK TO API AND MAKE THE MEME (POST REQUEST)--- */
    const saveMeme = async () =>{
        //format the body of our request to send back to imgflip API
        const memeData = new FormData();
        memeData.append('username', 'alkalilord'); //Alex's account 
        memeData.append('password', 'abc12345'); //Alex's account
        memeData.append('template_id', meme.id); //meme to be sent out
        captions.forEach((c, index)=> memeData.append(`boxes[${index}][text]`, c)); //creating a property called boxes in memeData, for each index, save a key called text & assign value that = c 
        
        console.log(memeData);
        // make a POST request w updated body via FETCH
        try{
            let response = await fetch('https://api.imgflip.com/caption_image', {
                method: 'POST',
                body: memeData //values that need to be passed back to the api (this is a FormData obj)
            });
            //handle the response from API
            response = await response.json(); //returned url contains generated meme!
            console.log('in the try block', response);
            // handle the response from api by navigating to new view
            history.push(`/meme?url=${response.data.url}`);    //pushing path (/meme) into useHistory()
        } catch (err){
            console.log(err);
        }
    };

    return (
        <div className="row">
            <div className="col-sm-12 col-md-4">
                <form action="">
                    {captions.map((c, index)=>{
                        return(
                            <div className="form-group" key={index}>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    onChange={e => updateCaptions(e, index)} //this index is from updateCaptions()
                                    placeholder={`set caption ${index+1}`}
                                    //no Value attribute becuase this input is dynamic
                                />
                            </div>                       
                        )
                    })
                    }
                </form>
                <button 
                    className="btn btn-block btn-warning" 
                    onClick={setMemeComponent}>New Meme
                </button>
                <button 
                    className="btn btn-block btn-success" onClick={saveMeme}>Save
                </button>
            </div>
            <div className="col-sm-12 col-md-8">
                <div className="meme text-center">
                    {memeData.length>0?(
                        <img src={meme.url} alt={meme.name}/>):(<div></div>) //if memeData renderes a meme, display this image
                    }
                </div>
            </div>
        </div>
    )
};

export default Meme;