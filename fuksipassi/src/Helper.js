import React from 'react'
import Dropzone from 'react-dropzone'

const UploadZone = ({children}) => (
    <Dropzone onDrop={(files) => console.log(files)}>{children} </Dropzone>
);


export default UploadZone;