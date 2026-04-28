import { useRef } from "react"
import { useState } from "react"


function PhotoUpload({onPhotoReady}) {
    const inputRef = useRef(null)
    const [photoURL, setPhotoURL] = useState(null)
    const [dragging, setDragging] = useState(false)

    function handleFileChange(e) {
        const file = e.target.files[0]
        if (file) loadPhoto(file)
    }

    //Converts the file into a preview URL and display it
    function loadPhoto(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.')
            return
        }

        const url = URL.createObjectURL(file)
        setPhotoURL(url)

        if (onPhotoReady) onPhotoReady(url)
    }

    //Drag and drop handler
    function handleDragOver(e) {
        e.preventDefault()
        setDragging(true)
    }

    function handleDragLeave() {
        setDragging(false)
    }

    function handleDrop(e) {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) loadPhoto(file)
    }

    //Remove the current photo and reset
    function removePhoto() {
        setPhotoURL(null)
        if (inputRef.current) inputRef.current.value = ''
        if (onPhotoReady) onPhotoReady(null)
    }

    return (
        <div style={{width: '100%', height: '100%', position: 'relative'}}>

            {/* HIdden file input - triggered by the button click */}
            <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{display: 'none'}} />

            {/* If no photo yet - show upload area */}
            {!photoURL && (
                <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '14px',
                    border: dragging ? '2px dashed #e8a0bc' : '2px dashed transparent',
                    borderRadius: '16px',
                    backgroundColor: dragging ? '#fff0f5' : 'transparent',
                    transition: 'all 0.2s ease',
                }}>
                    <div style={{fontSize: '48px'}}>🖼️</div>
                    <div style={{textAlign: 'center'}}>
                        <p style={{fontSize:'15px', color: '#9b6b80', fontWeight: '500'}}>
                            Upload your photo
                        </p>
                        <p style={{ fontSize: '12px', color: '#c4a0b4', marginTop: '4px'}}>
                            Drag & drop or click the button below
                        </p>
                    </div>

                    <button
                    onClick={() => inputRef.current.click()}
                    style={{
                        fontSize:'13px', padding: '10px 24px',
                        borderRadius: '20px', border: 'none',
                        backgroundColor: '#fbdce8', color: '#8d3060',
                        cursor: 'pointer', fontWeight: '500',
                    }}>
                        Choose photo
                    </button>

                    <p style={{fontSize: '11px', color: '#c4a0b4'}}>
                        Supports JPG, PNG, WEBP
                    </p>
                </div>
            )}

            {/* If photo is uploaded - show it */}
            {photoURL && (
                <div style={{width: '100%', height: '100%', position: 'relative'}}>
                    <img
                    src={photoURL}
                    alt="Uploaded face"
                    style={{
                        width:'100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '16px',
                    }} />

                    {/* Remove photo button */}
                    <button
                    onClick={removePhoto}
                    style={{
                        position:'absolute',
                        bottom: '14px',
                        left: '14px',
                        fontSize: '12px', padding: '6px 14px',
                        borderRadius: '20px', border: 'none',
                        backgroundColor: 'rgba(0,0,0,0.35)',
                        color: 'white', cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        zIndex: 50,
                    }}>
                        <span>x</span> Remove photo
                    </button>
                </div>
            )}
        </div>
    )
}

export default PhotoUpload