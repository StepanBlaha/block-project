import SavedPost from "@/components/Post"

function SavedPostList({ queryData, openSavedCanvas, updateName, deleteData, blurRef }){
  return(
    <>
    {queryData ? (
      <div className="savedPostTable">
        {queryData.map((data) => {
          const { _id, name, image, date } = data;
          return (
            <SavedPost
              id={_id}
              name={name}
              image={image}
              date={date}
              openFunc={openSavedCanvas}
              updateFunc={updateName}
              deleteFunc={deleteData}
              key={_id}
              blur={blurRef}
            />
          );
        })}
      </div>
    ) : (
      <div>No data available</div>
    )}
</>
)}
export default SavedPostList;