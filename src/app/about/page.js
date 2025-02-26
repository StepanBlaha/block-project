import "./../../styles/about.css";

const Page = () => {
    return(
        <>
            <div className="Main">
                <div className="Navbar">

                </div>

                <div className="Content">

                    <div className="Hero">
                        <div className="HeroContent">

                            <div className="HeroCenter">
                                <div className="HeroTitle">
                                    <h2>Hero Title</h2>
                                </div>
                                <div className="HeroDescription">
                                    <p>Hero Description</p>
                                </div>
                                <div className="HeroButton"> 
                                    <p>Start drawing</p>
                                </div>  
                            </div>

                        </div>

                        <div className="HeroImage">

                            <div className="HeroScreen">
                                <div class="MockupFrame relative mx-auto border-neutral-900 dark:border-neutral-900 bg-neutral-900 border-[14px] rounded-[2.5rem] h-[454px] max-w-[341px] md:h-[682px] md:max-w-[512px]">
                                    <div class=" h-[32px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                                    <div class=" h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                                    <div class=" h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                                    <div class=" h-[64px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                                    <div class="screen-shadow rounded-[2rem] overflow-hidden h-[426px] md:h-[654px] bg-white dark:bg-neutral-900">
                                        <img src="/canvas_screen.png" class=" dark:hidden h-[426px] md:h-[654px]" alt=""/>
                                        <img src="/canvas_screen.png" class=" hidden dark:block h-[426px] md:h-[654px]" alt=""/>
                                    </div>
                                </div>

                                <div className="HeroPhone">
                                    <div class="relative mx-auto border-neutral-900 dark:border-neutral-900 bg-neutral-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
                                        <div class="h-[32px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                                        <div class="h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                                        <div class="h-[46px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                                        <div class="h-[64px] w-[3px] bg-neutral-900 dark:bg-neutral-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                                        <div class="screen-shadow  rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-neutral-900">
                                            <img src="/canvas_screen_phone.png" class="dark:hidden w-[272px] h-[572px]" alt=""/>
                                            <img src="/canvas_screen_phone.png" class="hidden dark:block w-[272px] h-[572px]" alt=""/>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="Features">
                        <div className="FeatureGrid">
                            <div className="Feature Feature1"></div>
                            <div className="Feature Feature2"></div>
                            <div className="Feature Feature3"></div>
                            <div className="Feature Feature4"></div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
export default Page;