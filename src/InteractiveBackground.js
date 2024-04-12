import "./InteractiveBackground.css";
import React, { useEffect } from "react";

const InteractiveBackground = () => {
  useEffect(() => {
    const sunElement = document.querySelector("#retrobg-sun");

    const toggleShutdown = () => {
      const retroBgElement = document.querySelector("#retrobg");
      retroBgElement.classList.toggle("retrobg-shutdown");
    };

    sunElement.addEventListener("click", toggleShutdown);

    // Cleanup event listener
    return () => {
      sunElement.removeEventListener("click", toggleShutdown);
    };
  }, []);

  return (
    <>
      <div id="retrobg">
        <div id="retrobg-sky">
          <div id="retrobg-stars">
            <div
              className="retrobg-star"
              style={{ left: "5%", top: "55%", transform: "scale(2)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "10%", top: "45%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "12%", top: "35%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "15%", top: "39%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "20%", top: "10%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "35%", top: "50%", transform: "scale(2)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "40%", top: "16%", transform: "scale(2)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "43%", top: "28%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "45%", top: "30%", transform: "scale(3)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "55%", top: "18%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "60%", top: "23%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "62%", top: "44%", transform: "scale(2)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "67%", top: "27%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "75%", top: "10%", transform: "scale(2)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "80%", top: "25%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "83%", top: "57%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "90%", top: "29%", transform: "scale(2)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "96%", top: "72%", transform: "scale(1)" }}
            ></div>
            <div
              className="retrobg-star"
              style={{ left: "98%", top: "70%", transform: "scale(3)" }}
            ></div>
          </div>
          <div id="retrobg-sunWrap">
            <div id="retrobg-sun"></div>
          </div>
          <div id="retrobg-mountains">
            <div id="retrobg-mountains-left" className="retrobg-mountain"></div>
            <div
              id="retrobg-mountains-right"
              className="retrobg-mountain"
            ></div>
          </div>
        </div>
        <div id="retrobg-ground">
          <div id="retrobg-linesWrap">
            <div id="retrobg-lines">
              <div id="retrobg-vlines">
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
                <div class="retrobg-vline"></div>
              </div>
              <div id="retrobg-hlines">
                <div class="retrobg-hline"></div>
                <div class="retrobg-hline"></div>
                <div class="retrobg-hline"></div>
                <div class="retrobg-hline"></div>
                <div class="retrobg-hline"></div>
                <div class="retrobg-hline"></div>
                <div class="retrobg-hline"></div>
                <div class="retrobg-hline"></div>
              </div>
            </div>
          </div>
          <div id="retrobg-groundShadow"></div>
        </div>
      </div>
    </>
  );
};

export default InteractiveBackground;
