/*
MIT License

Copyright (c) 2023 World We Want. Maintainers: Thomas Wood, https://fastdatascience.com, Zairon Jacobs, https://zaironjacobs.com.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

import React from 'react'

interface IInputProps {
    id: string
    placeHolder: string
    controllerRenderOnChange: (...event: any[]) => void
    value: string
    onChange?: () => void // A function to run when the value of this input changes
}

export const Input = ({ id, placeHolder, controllerRenderOnChange, value, onChange }: IInputProps) => {
    return (
        <input
            id={id}
            className="w-0 min-w-full rounded-md border border-[#CCC] p-1.5"
            type="text"
            placeholder={placeHolder}
            value={value}
            onChange={(value) => {
                controllerRenderOnChange(value)

                if (onChange) {
                    onChange()
                }
            }}
        />
    )
}
