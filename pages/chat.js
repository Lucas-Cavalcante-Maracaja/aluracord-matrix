import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js';
import { Rings  } from 'react-loading-icons'
import GitUserPage from './gitUser';
import Popover from '@mui/material/Popover';
import { ButtonSendSticker } from '../components/ButtonSendSticker';

const supabaseClient = createClient(appConfig.supabase_url,process.env.NEXT_PUBLIC_SUPABASE_API_KEY);
function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
      .from('mensagens')
      .on('INSERT', (respostaLive) => {
        adicionaMensagem(respostaLive.new);
      })
      .subscribe();
  }


export default function ChatPage() {
    const router = useRouter();
    const [mensagem, setMensagem] = React.useState('')
    const [listaDeMensagens, setListaDeMensagens]=React.useState([])
    const [tempMensagem, setTempMensagem] = React.useState('')
    const [loading, setLoading] = React.useState(true)

    // Sua lógica vai aqui

    function handleNovaMensage(novaMensagem){
        const mensagem = {
            // id: listaDeMensagens.length + 1,
            de: router.query.username,
            texto: novaMensagem,
          };
      
          supabaseClient
            .from('mensagens')
            .insert([
              // Tem que ser um objeto com os MESMOS CAMPOS que você escreveu no supabase
              mensagem
            ])
            .then(({ data }) => {
                /*setListaDeMensagens([
                    data[0],
                    ...listaDeMensagens,
                  ]);*/
                  setMensagem('')
                });
    }

    React.useEffect(() => {
        supabaseClient
          .from('mensagens')
          .select('*')
          .order('created_at',{ascending:false})
          .then(({ data }) => {
            //console.log('Dados da consulta:', data);
            if(data!=null){
                setListaDeMensagens(data);
            }

            setLoading(false)
          });


          const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
            console.log('Nova mensagem:', novaMensagem);
            console.log('listaDeMensagens:', listaDeMensagens);
            // Quero reusar um valor de referencia (objeto/array) 
            // Passar uma função pro setState

            setListaDeMensagens((valorAtualDaLista) => {
              console.log('valorAtualDaLista:', valorAtualDaLista);
              return [
                novaMensagem,
                ...valorAtualDaLista,
              ]
            });
          });
      
          return () => {
            subscription.unsubscribe();
          }
        }, []);
   
    let username = router.query.username;
    React.useEffect(() => {
        getUserData();
    }, [username]);
    
    var gitHubUrl = `https://api.github.com/users/${username}`;
  
    const getUserData = async () => {
            const response = await fetch(gitHubUrl);
            const jsonData = await response.json();
            if (!(jsonData && jsonData.message !== "Not Found") && username !== '') {
                console.log('Username does not exist');
                router.push({
                    pathname:'/404'
                  });
            }
        };



    // ./Sua lógica vai aqui
    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundImage: `url(https://static.zerochan.net/Astrea.Record.full.3365134.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >



            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    {loading?
                    <Rings />
                
                :<MessageList mensagens={listaDeMensagens} setListaDeMensagens={setListaDeMensagens} /> }
                    

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                            onKeyPress={(event)=>{
                                if(event.key === 'Enter'){
                                    event.preventDefault();
                                    handleNovaMensage(event.target.value)
                                    setTempMensagem('')
                                }
                            }}
                            onChange={(event)=>{
                                    event.preventDefault();
                                    setTempMensagem(event.target.value)
                                    setMensagem(event.target.value)
                            }}
                        />

                        <Button
                         type='button'
                         label='Enviar'
                         styleSheet={{
                            border: '0',
                            resize: 'none',
                            borderRadius: '5px',
                            padding: '6px 8px',
                            marginRight: '12px',
                            alignItems:"center",
                            marginBottom:'10px',
                            paddingTop:"12px",
                            paddingBottom:"12px",
                         }}
                         buttonColors={{
                             
                             contrastColor: appConfig.theme.colors.neutrals["000"],
                             mainColor: appConfig.theme.colors.primary[500],
                             mainColorLight: appConfig.theme.colors.primary[400],
                             mainColorStrong: appConfig.theme.colors.primary[600],
                         }}
                         onClick={() =>{
                            handleNovaMensage(tempMensagem)
                            setTempMensagem('')
                         }}
                         />

                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                // console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
                                handleNovaMensage(':sticker: ' + sticker);
                            }}
            />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    const router = useRouter();


    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    async function handleDeleteMessage(mensagemId){
        await supabaseClient
            .from('mensagens')
            .delete()
            .match({ id: mensagemId })

        let novaLista = props.mensagens.filter((message)=>{
            if(message.id != mensagemId){
                return message
            }
        })

        props.setListaDeMensagens([
            ...novaLista
        ])
    }

    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem)=>{
                return(
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                                onMouseEnter={handlePopoverOpen}
                                onMouseLeave={handlePopoverClose}
                            />
                            <Text tag="strong" onClick={function (infosDoEvento){
                                    infosDoEvento.preventDefault();
                    
                                    router.push({
                                    pathname:'/git',
                                    query:{username:mensagem.de, from:'/chat'}
                                    });
                                }}> 
                                {mensagem.de}
                            </Text>

                            <Button
                                type='button'
                                label='X'
                                styleSheet={{marginLeft:'3px',width: '20px',
                                height: '20px',}}
                                onClick={() => handleDeleteMessage(mensagem.id)}
                            />
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                        </Box>
                        {/* [Declarativo] */}
                        {/* Condicional: {mensagem.texto.startsWith(':sticker:').toString()} */}
                        {mensagem.texto.startsWith(':sticker:')
                        ? (
                            <Image src={mensagem.texto.replace(':sticker:', '')} />
                        )
                        : (
                            mensagem.texto
                        )}
                        {/* if mensagem de texto possui stickers:
                                    mostra a imagem
                                    else 
                                    mensagem.texto */}
                        {/* {mensagem.texto} */}


                        <Popover
                            id="mouse-over-popover"
                            sx={{
                            pointerEvents: 'none',
                            }}
                            open={open}
                            anchorEl={anchorEl}
                            anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                            }}
                            transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                            }}
                            onClose={handlePopoverClose}
                            disableRestoreFocus
                        >
                            <GitUserPage username={mensagem.de}/>
                        </Popover>
                    </Text>
                )
            })}
            
        </Box>
    )
}