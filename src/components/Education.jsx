import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Education.css'

gsap.registerPlugin(ScrollTrigger)

export default function Education() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const bg = sectionRef.current.querySelector('.edu-bg-img')
      const frame = sectionRef.current.querySelector('.edu-frame')
      const photo = sectionRef.current.querySelector('.edu-frame-photo img')
      const plate = sectionRef.current.querySelector('.edu-frame-plate')
      const corners = sectionRef.current.querySelectorAll('.edu-frame-corner')

      if (reduceMotion) {
        gsap.set('.edu-reveal, .edu-frame, .edu-campus-brand, .edu-frame-plate, .edu-frame-corner', {
          clearProps: 'all',
          opacity: 1,
        })
        return
      }

      gsap.set('.edu-reveal', { y: 42, opacity: 0 })
      gsap.set(frame, { y: 56, rotate: -2.4, opacity: 0, transformOrigin: '50% 0%' })
      gsap.set(photo, { scale: 1.16 })
      gsap.set(plate, { y: 16, opacity: 0 })
      gsap.set(corners, { scale: 0, opacity: 0 })
      gsap.set('.edu-campus-brand', { y: 20, opacity: 0 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 74%',
          once: true,
        },
      })

      tl.to('.edu-reveal', {
        y: 0,
        opacity: 1,
        duration: 0.82,
        stagger: 0.09,
      }, 0)
        .to('.edu-campus-brand', {
          y: 0,
          opacity: 1,
          duration: 0.7,
        }, 0.12)
        .to(frame, {
          y: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.05,
          ease: 'power4.out',
        }, 0.18)
        .to(photo, {
          scale: 1,
          duration: 1.25,
          ease: 'power2.out',
        }, 0.28)
        .to(corners, {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          stagger: 0.06,
          ease: 'back.out(1.6)',
        }, 0.42)
        .to(plate, {
          y: 0,
          opacity: 1,
          duration: 0.5,
        }, 0.55)

      if (bg) {
        gsap.fromTo(
          bg,
          { scale: 1.1, y: 0 },
          {
            scale: 1,
            y: -48,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="edu-section" ref={sectionRef} id="education">
      <div className="edu-bg" aria-hidden="true">
        <img
          className="edu-bg-img"
          src="/images/gedung-mulia.png"
          alt=""
        />
        <div className="edu-bg-shade" />
        <div className="edu-atmosphere-bloom teal" />
        <div className="edu-atmosphere-bloom magenta" />
        <div className="edu-atmosphere-bloom gold" />
        <div className="edu-atmosphere-grid" />
        <div className="edu-atmosphere-vignette" />
        <div className="edu-atmosphere-grain" />
      </div>

      <div className="edu-layout">
        <div className="edu-copy">
          <div className="edu-intro">
            <span className="edu-eyebrow edu-reveal">02 // EDUCATION</span>
            <h2 className="edu-heading edu-reveal">Pendidikan</h2>
            <p className="edu-lead edu-reveal">
              Fondasi teknis saya dibentuk di Balikpapan: kampus technopreneur, jurusan
              yang menuntut merancang, membangun, lalu mengeksekusi.
            </p>
          </div>

          <div className="edu-degree-card edu-reveal">
            <div className="edu-degree-top">
              <div>
                <p className="edu-degree-kicker">Fakultas Ilmu Komputer</p>
                <h3 className="edu-degree-title">Sarjana Komputer (S.Kom.) · Informatika</h3>
                <p className="edu-degree-campus">
                  Universitas Mulia · Balikpapan ·{' '}
                  <a
                    href="https://universitasmulia.ac.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    universitasmulia.ac.id
                  </a>
                </p>
              </div>
              <div className="edu-degree-meta">
                <span>Sep 2021 — 2025</span>
                <span className="edu-gpa">IPK 3.39 / 4.00</span>
              </div>
            </div>
          </div>

          <article className="edu-story edu-reveal">
            <span className="edu-story-index">01</span>
            <h3>Universitas Mulia Balikpapan</h3>
            <p>
              Universitas Mulia adalah kampus swasta di Balikpapan yang tumbuh dari
              STMIK / STIKOM. Arahnya jelas: lulusan yang paham teori dan mampu bergerak di industri.
            </p>
            <p>
              Di Fakultas Ilmu Komputer, mahasiswa dilatih merancang dan mengeksekusi
              solusi digital — dari perangkat lunak sampai produk yang dipakai orang.
            </p>
            <ul>
              <li>Kampus swasta di Balikpapan, Kalimantan Timur</li>
              <li>Fokus pada technopreneurship dan praktik industri</li>
              <li>Fakultas Ilmu Komputer sebagai rumah prodi Informatika</li>
            </ul>
            <a
              className="edu-story-link"
              href="https://universitasmulia.ac.id/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Situs resmi Universitas Mulia
            </a>
          </article>

          <article className="edu-story edu-reveal">
            <span className="edu-story-index">02</span>
            <h3>S1 Informatika</h3>
            <p>
              Program Studi S1 Informatika menghasilkan lulusan Sarjana Komputer (S.Kom.)
              yang merancang aplikasi web dan mobile, menganalisis perangkat lunak, serta
              membangun sistem cerdas.
            </p>
            <p>
              Kurikulum memakai Outcome-Based Education. Dari semester empat ada dua
              konsentrasi: <strong>Artificial Intelligence &amp; Robotics</strong> dan{' '}
              <strong>Mobile Application Development</strong> — selaras dengan kerja saya
              di agent AI dan aplikasi Android.
            </p>
            <ul>
              <li>Pemrograman, jaringan, dan rekayasa perangkat lunak</li>
              <li>Konsentrasi AI &amp; Robotics atau Mobile Application</li>
              <li>Penekanan pada karya yang bisa diimplementasikan, bukan hanya tugas kelas</li>
            </ul>
          </article>
        </div>

        <aside className="edu-visuals">
          <a
            className="edu-campus-brand"
            href="https://universitasmulia.ac.id/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="edu-campus-logo"
              src="/images/logo-mulia-mark.png"
              alt="Lambang Universitas Mulia"
            />
            <div className="edu-campus-brand-copy">
              <p className="edu-campus-brand-name">Universitas Mulia</p>
              <span className="edu-campus-brand-sub">Balikpapan · Inovatif · Mandiri · Humanis</span>
            </div>
          </a>

          <figure className="edu-frame">
            <span className="edu-frame-corner tl" aria-hidden="true" />
            <span className="edu-frame-corner tr" aria-hidden="true" />
            <span className="edu-frame-corner bl" aria-hidden="true" />
            <span className="edu-frame-corner br" aria-hidden="true" />
            <div className="edu-frame-photo">
              <img
                src="/images/wisuda-jidan.png"
                alt="Muhammad Alif Sajidan dalam toga wisuda Universitas Mulia"
              />
            </div>
            <figcaption className="edu-frame-plate">
              <span>Wisuda</span>
              S.Kom. Informatika · 2025
            </figcaption>
          </figure>
        </aside>
      </div>
    </section>
  )
}
